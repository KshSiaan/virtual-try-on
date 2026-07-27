import { auth } from "@/lib/auth";
import { createAffiliateSchema } from "@/lib/zod/affiliate";
import { db } from "@/lib/db";
import { affiliateProduct } from "@/db/schema/affiliate-schema";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { and, count, desc, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const getQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const { page, limit, q } = getQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      q: url.searchParams.get("q") ?? "",
    });

    const offset = (page - 1) * limit;
    const filters = q ? [ilike(affiliateProduct.name, `%${q}%`)] : [];

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(affiliateProduct)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(affiliateProduct.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(affiliateProduct)
        .where(filters.length > 0 ? and(...filters) : undefined),
    ]);

    return Response.json({
      message: "Affiliate products fetched",
      data: items,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.total ?? 0,
        hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    console.error("Error fetching affiliate products:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Invalid query parameters", error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authorId = session.session.userId;
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const size = formData.get("size") as string;
    const fit = formData.get("fit") as string;
    const chest = formData.get("chest") as string;
    const shoulder = formData.get("shoulder") as string;
    const sleeve = formData.get("sleeve") as string;
    const affiliateUrl = formData.get("affiliateUrl") as string;
    const brand = formData.get("brand") as string;
    const priceRaw = formData.get("price") as string | null;
    const currency = formData.get("currency") as string;
    const storeName = formData.get("storeName") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File | null;

    const validated = createAffiliateSchema.parse({
      name,
      description: description || undefined,
      type: type || undefined,
      size: size || undefined,
      fit: fit || undefined,
      chest: chest || undefined,
      shoulder: shoulder || undefined,
      sleeve: sleeve || undefined,
      affiliateUrl,
      brand: brand || undefined,
      price: priceRaw ? Number(priceRaw) : undefined,
      currency: currency || undefined,
      storeName: storeName || undefined,
      isActive,
    });

    if (!imageFile || imageFile.size === 0) {
      return Response.json({ message: "Image is required" }, { status: 400 });
    }

    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${authorId}_${Date.now()}_${uuidv4()}.${fileExt}`;
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await getSupabaseStorageClient()
      .storage.from("affiliates")
      .upload(`${authorId}/${fileName}`, buffer, {
        contentType: imageFile.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = getSupabaseStorageClient()
      .storage.from("affiliates")
      .getPublicUrl(`${authorId}/${fileName}`);

    const [newItem] = await db.insert(affiliateProduct).values({
      id: uuidv4(),
      authorId,
      name: validated.name,
      description: validated.description ?? null,
      image: publicUrlData.publicUrl,
      type: validated.type ?? null,
      size: validated.size ?? null,
      fit: validated.fit ?? null,
      chest: validated.chest ?? null,
      shoulder: validated.shoulder ?? null,
      sleeve: validated.sleeve ?? null,
      affiliateUrl: validated.affiliateUrl,
      brand: validated.brand ?? null,
      price: validated.price ?? null,
      currency: validated.currency ?? "USD",
      storeName: validated.storeName ?? null,
      isActive: validated.isActive ?? true,
    }).returning();

    return Response.json({ message: "Affiliate product created", data: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating affiliate product:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Validation failed", error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
