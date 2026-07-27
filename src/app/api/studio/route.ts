import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { affiliateProduct, closet as closetTable, studio, studioClosetItem } from "@/db/schema";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import sharp from "sharp";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";


// Request validation schema
const studioSchema = z.object({
  tryon: z.object({ id: z.string().min(1), imgUrl: z.url() }),
  closet: z
    .array(
      z.object({
        id: z.string().min(1),
        imgUrl: z.url(),
        source: z.enum(["closet", "recommendations", "wishlist", "affiliate"]).optional(),
      })
    )
    .min(1)
    .max(5),
  caption: z.string().max(400).optional(),
});

const IMAGE_MODEL = process.env.AI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const IMAGE_SIZE = "1024x1024";
const INPUT_IMAGE_MAX_WIDTH = Number(process.env.AI_INPUT_IMAGE_MAX_WIDTH || 768);
const INPUT_IMAGE_QUALITY = Number(process.env.AI_INPUT_IMAGE_QUALITY || 85);
// Limits: 2 per day for closet/recommendations, 10 per day for wishlist/affiliates
const DAILY_PERSONAL_ITEM_LIMIT = 2; // closet + recommendations
const DAILY_PUBLIC_ITEM_LIMIT = 10; // wishlist + affiliates

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "" });

// Fetch and compress to a reasonable size, returning raw base64 + mimeType for inline image parts.
async function fetchImageInlineData(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);

  const srcBuffer = Buffer.from(await res.arrayBuffer());
  const compressed = await sharp(srcBuffer)
    .rotate()
    .resize({ width: INPUT_IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: INPUT_IMAGE_QUALITY })
    .toBuffer();

  return { data: compressed.toString("base64"), mimeType: "image/jpeg" };
}

/**
 * POST /api/studio
 * Body: { tryon: {id,imgUrl}, closet: [{id,imgUrl}], caption }
 * Generates a virtual try-on image using the Google GenAI SDK.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[v0] Studio API request body:", body);

    // Validate request body with Zod
    const parsed = studioSchema.safeParse(body);
    if (!parsed.success) {
      console.log("[v0] Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tryon, closet: selectedItems, caption } = parsed.data;
    console.log("[v0] Validated data - tryon:", tryon?.id, "closet items:", selectedItems.length);

    // Authenticate user (Better Auth)
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      console.log("[v0] Unauthorized - no session");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.log("[v0] Authenticated user:", session.session.userId);

    const uniqueSelectedIds = [...new Set(selectedItems.map((item) => item.id))];
    const [affiliateMatches, closetMatches] = await Promise.all([
      db
        .select({ id: affiliateProduct.id })
        .from(affiliateProduct)
        .where(and(inArray(affiliateProduct.id, uniqueSelectedIds), eq(affiliateProduct.isActive, true))),
      db
        .select({ id: closetTable.id })
        .from(closetTable)
        .where(inArray(closetTable.id, uniqueSelectedIds)),
    ]);

    const affiliateIdSet = new Set(affiliateMatches.map((row) => row.id));
    const closetIdSet = new Set(closetMatches.map((row) => row.id));

    let personalItemCount = 0; // closet + recommendations
    let publicItemCount = 0;   // wishlist + affiliates

    for (const item of selectedItems) {
      // Determine item category based on source hint or database lookup
      if (item.source === "closet" || item.source === "recommendations") {
        personalItemCount += 1;
        continue;
      }

      if (item.source === "wishlist" || item.source === "affiliate") {
        publicItemCount += 1;
        continue;
      }

      // Fallback: determine by database lookup
      if (closetIdSet.has(item.id)) {
        personalItemCount += 1;
        continue;
      }

      if (affiliateIdSet.has(item.id)) {
        publicItemCount += 1;
        continue;
      }

      return NextResponse.json(
        {
          success: false,
          message: `Selected item ${item.id} is invalid or unavailable`,
        },
        { status: 400 }
      );
    }

    const isAdmin = session.user?.role === "admin";
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let dailyPersonalUsage = 0;
    let dailyPublicUsage = 0;
    if (!isAdmin) {
      const dailyUsageResult = await db
        .select({
          personalCount: sql<number>`coalesce(sum(${studio.closetItemCount}), 0)`.as("personalCount"),
          publicCount: sql<number>`coalesce(sum(${studio.affiliateItemCount}), 0)`.as("publicCount"),
        })
        .from(studio)
        .where(
          and(
            eq(studio.authorId, session.session.userId),
            gte(studio.createdAt, dayStart),
            lt(studio.createdAt, nextDayStart),
          ),
        );

      dailyPersonalUsage = Number(dailyUsageResult[0]?.personalCount ?? 0);
      dailyPublicUsage = Number(dailyUsageResult[0]?.publicCount ?? 0);

      const personalRemaining = DAILY_PERSONAL_ITEM_LIMIT - dailyPersonalUsage;
      const publicRemaining = DAILY_PUBLIC_ITEM_LIMIT - dailyPublicUsage;

      if (personalRemaining <= 0 && personalItemCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `You've reached your daily limit for closet & recommendation items. You can generate 0 more from your closet or friend recommendations today. You still have ${Math.max(0, publicRemaining)} from wishlist/affiliate items.`,
          },
          { status: 429 }
        );
      }

      if (publicRemaining <= 0 && publicItemCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `You've reached your daily limit for wishlist & affiliate items. You can generate 0 more from wishlist/affiliate items today. You still have ${Math.max(0, personalRemaining)} from closet/recommendations.`,
          },
          { status: 429 }
        );
      }

      if (dailyPersonalUsage + personalItemCount > DAILY_PERSONAL_ITEM_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            message: `Closet & recommendation item limit exceeded. You can generate ${personalRemaining} more from your closet or friend recommendations today. You still have ${Math.max(0, publicRemaining)} from wishlist/affiliate items.`,
          },
          { status: 429 }
        );
      }

      if (dailyPublicUsage + publicItemCount > DAILY_PUBLIC_ITEM_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            message: `Wishlist & affiliate item limit exceeded. You can generate ${publicRemaining} more from wishlist/affiliate items today. You still have ${Math.max(0, personalRemaining)} from closet/recommendations.`,
          },
          { status: 429 }
        );
      }
    }

    // Fetch and compress images as proper inline binary data (not embedded text).
    console.log("[v0] Fetching images...");
    const [tryonInline, ...closetInlines] = await Promise.all([
      fetchImageInlineData(tryon.imgUrl),
      ...selectedItems.map((c) => fetchImageInlineData(c.imgUrl)),
    ]);
    console.log("[v0] Images ready, closet count:", closetInlines.length);

    // Build multimodal content parts: text instruction + actual image binaries.
    const closetInstruction =
      closetInlines.length === 1
        ? "the clothing item in the next image"
        : `each of the ${closetInlines.length} clothing items in the following images`;

    const textInstruction =
      `Virtual try-on: show the exact person from the first image wearing ${closetInstruction}. ` +
      `Preserve the person's face, skin tone, hair, body shape, and pose exactly as they appear. ` +
      `Only replace the clothing — do not alter anything else about the person or background. ` +
      (caption?.trim() ? `Additional instruction: ${caption.trim()}` : "");

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: textInstruction },
      { inlineData: { mimeType: tryonInline.mimeType, data: tryonInline.data } },
      ...closetInlines.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
    ];

    console.log("[v0] Calling Gemini generateContent...");
    const geminiResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts }],
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const imagePart = geminiResponse.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.data
    );
    if (!imagePart?.inlineData?.data) {
      throw new Error("No image returned from Gemini");
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType ?? "image/png";
    console.log("[v0] Image generated, base64Data length:", base64Data.length);

    console.log("[v0] Uploading to Supabase...");
    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
    const fileName = `${session.session.userId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");

    const { data, error } = await getSupabaseStorageClient()
      .storage
      .from("studio")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });
    
    if (error) {
      console.error("[v0] Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    console.log("[v0] Image uploaded successfully, path:", data?.path);

    // Generate public URL for the uploaded image
    const { data: { publicUrl } } = getSupabaseStorageClient()
      .storage
      .from("studio")
      .getPublicUrl(fileName);

    const studioId = uuidv4();
    const studioRecord = {
      id: studioId,
      authorId: session.session.userId,
      tryonId: tryon.id,
      resultImageUrl: publicUrl,
      caption: caption ?? null,
      model: IMAGE_MODEL,
      size: IMAGE_SIZE,
      affiliateItemCount: publicItemCount,
      closetItemCount: personalItemCount,
    };

    const savedStudio = await (async () => {
      const [createdStudio] = await db.insert(studio).values(studioRecord).returning();

      try {
        const selectedClosetItems = selectedItems.filter((item) => closetIdSet.has(item.id));

        if (selectedClosetItems.length > 0) {
          await db.insert(studioClosetItem).values(
            selectedClosetItems.map((item, index) => ({
              id: uuidv4(),
              studioId: createdStudio.id,
              closetItemId: item.id,
              sortOrder: index,
            }))
          );
        }

        return createdStudio;
      } catch (error) {
        await db.delete(studio).where(eq(studio.id, createdStudio.id)).catch(() => null);
        await getSupabaseStorageClient()
          .storage
          .from("studio")
          .remove([fileName])
          .catch(() => null);
        throw error;
      }
    })();

    const personalUsed = dailyPersonalUsage + personalItemCount;
    const publicUsed = dailyPublicUsage + publicItemCount;
    const personalRemaining = Math.max(0, DAILY_PERSONAL_ITEM_LIMIT - personalUsed);
    const publicRemaining = Math.max(0, DAILY_PUBLIC_ITEM_LIMIT - publicUsed);

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? "Success! Unlimited studio trials for admin accounts."
          : `Success! Today's usage - Closet/Recommendations: ${personalUsed}/${DAILY_PERSONAL_ITEM_LIMIT} (${personalRemaining} remaining), Wishlist/Affiliates: ${publicUsed}/${DAILY_PUBLIC_ITEM_LIMIT} (${publicRemaining} remaining).`,
        model: IMAGE_MODEL,
        size: IMAGE_SIZE,
        studio: savedStudio,
        image: {
          url: publicUrl,
          path: data?.path
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    const cause = err instanceof Error ? (err as Error & { cause?: unknown }).cause : undefined;
    console.error("[v0] /api/studio error:", message);
    console.error("[v0] Stack trace:", stack);
    if (cause) console.error("[v0] Cause:", cause);
    return NextResponse.json({ success: false, message: message ?? "Internal server error" }, { status: 500 });
  }
}
