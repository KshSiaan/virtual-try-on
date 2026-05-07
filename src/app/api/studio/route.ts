import { auth } from "@/lib/auth";
import { z } from "zod";
import { NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateImage } from 'ai';
import sharp from "sharp";
import { getSupabaseStorageClient } from "@/lib/supabase";


// Request validation schema
const studioSchema = z.object({
  tryon: z.object({ id: z.string().min(1), imgUrl: z.url() }),
  closet: z
    .array(z.object({ id: z.string().min(1), imgUrl: z.url() }))
    .min(1)
    .max(5),
  caption: z.string().max(400).optional(),
});

// Environment-configurable model/size
const IMAGE_MODEL = process.env.AI_IMAGE_MODEL || process.env.AI_MODEL || "gpt-image-1";
const IMAGE_SIZE = process.env.AI_IMAGE_SIZE || "1024x1024";
const INPUT_IMAGE_MAX_WIDTH = Number(process.env.AI_INPUT_IMAGE_MAX_WIDTH || 160);
const INPUT_IMAGE_QUALITY = Number(process.env.AI_INPUT_IMAGE_QUALITY || 35);
const MAX_PROMPT_CHARS = Number(process.env.AI_MAX_PROMPT_CHARS || 30000);

// Fetch + aggressively compress to keep prompt below provider token limits.
async function fetchCompressedDataUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);

  const srcBuffer = Buffer.from(await res.arrayBuffer());
  const compressed = await sharp(srcBuffer)
    .rotate()
    .resize({ width: INPUT_IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: INPUT_IMAGE_QUALITY })
    .toBuffer();

  return `data:image/webp;base64,${compressed.toString("base64")}`;
}

function trimByChars(value: string, maxChars: number) {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 20))} ...[truncated]`;
}

/**
 * POST /api/studio
 * Body: { tryon: {id,imgUrl}, closet: [{id,imgUrl}], caption }
 * Generates a photorealistic virtual try-on image using the Vercel AI SDK (`ai`).
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

    const { tryon, closet, caption } = parsed.data;
    console.log("[v0] Validated data - tryon:", tryon?.id, "closet items:", closet.length);

    // Authenticate user (Better Auth)
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      console.log("[v0] Unauthorized - no session");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.log("[v0] Authenticated user:", session.session.userId);

    // Compress image inputs before prompt embedding to reduce token pressure.
    console.log("[v0] Compressing images...");
    const tryonDataUrl = await fetchCompressedDataUrl(tryon.imgUrl);
    console.log("[v0] Tryon image compressed");
    const closetDataUrls = await Promise.all(
      closet.map((c) => fetchCompressedDataUrl(c.imgUrl))
    );
    console.log("[v0] Closet images compressed, count:", closetDataUrls.length);

    // Build a strong image-generation prompt. We include the data URIs and explicit
    // instructions to preserve identity/pose and to accurately apply clothing items.
    const promptLines: string[] = [];
    promptLines.push("Create a photorealistic fashion image following these instructions:");
    promptLines.push(
      "1) Use the first image as the base identity and person. Preserve face, hairstyle, body shape, pose, and proportions exactly. Do not change facial identity.");
    promptLines.push(
      "2) Apply the clothing and accessories from the provided closet images onto the same person so they appear naturally worn. Keep realistic folds, lighting, occlusion, and layering.");
    promptLines.push(
      "3) Use the caption below as creative direction for scene composition, lighting, camera angle, environment, background, and mood.");
    promptLines.push("");
    promptLines.push(`CAPTION: ${caption ?? ""}`);
    promptLines.push("");
    promptLines.push("BASE PERSON IMAGE (data URI):");
    promptLines.push(trimByChars(tryonDataUrl, Math.floor(MAX_PROMPT_CHARS * 0.35)));
    promptLines.push("");
    promptLines.push("CLOSET ITEM IMAGES (data URIs) - apply these in order:");
    closetDataUrls.forEach((d, i) => {
      promptLines.push(
        `ITEM ${i + 1}: ${trimByChars(d, Math.floor((MAX_PROMPT_CHARS * 0.6) / Math.max(1, closetDataUrls.length)))}`
      );
    });
    promptLines.push("");
    promptLines.push(
      "Generate a single high-resolution, photorealistic image. Preserve the person's pose and identity. Ensure garments align naturally with the body and use the caption for styling and background. Output only the final image without additional annotations."
    );

    const prompt = trimByChars(promptLines.join("\n\n"), MAX_PROMPT_CHARS);
    console.log("[v0] Prompt built, length:", prompt.length);

    // Call the Vercel AI SDK image generation API. We use async/await and handle
    // several possible response shapes. Prefer high-quality settings when supported.
    console.log("[v0] Calling generateImage...");
    const response = await generateImage({
      model: google.image('gemini-2.5-flash-image'),
      prompt,
      size: IMAGE_SIZE as `${number}x${number}`,
    });
    console.log("[v0] Full response from generateImage:", JSON.stringify(response, null, 2));
    
    const image = response.image;
    console.log("[v0] Image object:", image);
    console.log("[v0] Image keys:", Object.keys(image || {}));
    
    if (!image || !image.base64) {
      throw new Error(`Invalid image response: ${JSON.stringify(image)}`);
    }
    
    console.log("[v0] Image generated, uploading to Supabase...");

    const {data} = await getSupabaseStorageClient().storage.from("studio").upload(`${session.session.userId}/${Date.now()}.webp`, Buffer.from(image.base64, "base64"), { contentType: "image/webp" });
    console.log("[v0] Image uploaded, fullPath:", data?.fullPath);

    return NextResponse.json(
      {
        success: true,
        model: IMAGE_MODEL,
        size: IMAGE_SIZE,
        image: {
          url: data?.fullPath
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("[v0] /api/studio error:", message);
    console.error("[v0] Stack trace:", stack);
    return NextResponse.json({ success: false, message: message ?? "Internal server error" }, { status: 500 });
  }
}
