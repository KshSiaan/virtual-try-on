import { auth } from "@/lib/auth";
import { createAffiliateSchema } from "@/lib/zod/affiliate";
import { db } from "@/lib/db";
import { affiliateProduct } from "@/db/schema/affiliate-schema";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const item = await db.query.affiliateProduct.findFirst({
      where: eq(affiliateProduct.id, id),
    });

    if (!item) {
      return Response.json({ message: "Affiliate product not found" }, { status: 404 });
    }

    return Response.json({ message: "Affiliate product fetched", data: item });
  } catch (error) {
    console.error("Error fetching affiliate product:", error);
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.affiliateProduct.findFirst({
      where: and(eq(affiliateProduct.id, id), eq(affiliateProduct.authorId, session.session.userId)),
    });

    if (!existing) {
      return Response.json({ message: "Affiliate product not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const name = (formData.get("name") as string) ?? undefined;
    const description = (formData.get("description") as string) ?? undefined;
    const type = (formData.get("type") as string) ?? undefined;
    const size = (formData.get("size") as string) ?? undefined;
    const fit = (formData.get("fit") as string) ?? undefined;
    const chest = (formData.get("chest") as string) ?? undefined;
    const shoulder = (formData.get("shoulder") as string) ?? undefined;
    const sleeve = (formData.get("sleeve") as string) ?? undefined;
    const affiliateUrl = (formData.get("affiliateUrl") as string) ?? undefined;
    const brand = (formData.get("brand") as string) ?? undefined;
    const priceRaw = formData.get("price") as string | null;
    const currency = (formData.get("currency") as string) ?? undefined;
    const storeName = (formData.get("storeName") as string) ?? undefined;
    const isActiveRaw = formData.get("isActive");
    const isActive = isActiveRaw === null ? undefined : isActiveRaw === "true";
    const imageFile = formData.get("image") as File | null;

    const partialSchema = createAffiliateSchema.partial();
    const validated = partialSchema.parse({
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description: description || undefined } : {}),
      ...(type !== undefined ? { type: type || undefined } : {}),
      ...(size !== undefined ? { size: size || undefined } : {}),
      ...(fit !== undefined ? { fit: fit || undefined } : {}),
      ...(chest !== undefined ? { chest: chest || undefined } : {}),
      ...(shoulder !== undefined ? { shoulder: shoulder || undefined } : {}),
      ...(sleeve !== undefined ? { sleeve: sleeve || undefined } : {}),
      ...(affiliateUrl !== undefined ? { affiliateUrl } : {}),
      ...(brand !== undefined ? { brand: brand || undefined } : {}),
      ...(priceRaw !== null ? { price: priceRaw ? Number(priceRaw) : undefined } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(storeName !== undefined ? { storeName: storeName || undefined } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });

    let imageUrl = existing.image;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const fileName = `${session.session.userId}_${Date.now()}_${uuidv4()}.${fileExt}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await getSupabaseStorageClient()
        .storage.from("affiliates")
        .upload(`${session.session.userId}/${fileName}`, buffer, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message || "Upload failed");

      const { data: publicUrlData } = getSupabaseStorageClient()
        .storage.from("affiliates")
        .getPublicUrl(`${session.session.userId}/${fileName}`);

      imageUrl = publicUrlData.publicUrl;
    }

    const updateData: Record<string, unknown> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description ?? null;
    if (validated.type !== undefined) updateData.type = validated.type ?? null;
    if (validated.size !== undefined) updateData.size = validated.size ?? null;
    if (validated.fit !== undefined) updateData.fit = validated.fit ?? null;
    if (validated.chest !== undefined) updateData.chest = validated.chest ?? null;
    if (validated.shoulder !== undefined) updateData.shoulder = validated.shoulder ?? null;
    if (validated.sleeve !== undefined) updateData.sleeve = validated.sleeve ?? null;
    if (validated.affiliateUrl !== undefined) updateData.affiliateUrl = validated.affiliateUrl;
    if (validated.brand !== undefined) updateData.brand = validated.brand ?? null;
    if (validated.price !== undefined) updateData.price = validated.price ?? null;
    if (validated.currency !== undefined) updateData.currency = validated.currency ?? "USD";
    if (validated.storeName !== undefined) updateData.storeName = validated.storeName ?? null;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (imageUrl !== existing.image) updateData.image = imageUrl;

    const [updated] = await db
      .update(affiliateProduct)
      .set(updateData)
      .where(and(eq(affiliateProduct.id, id), eq(affiliateProduct.authorId, session.session.userId)))
      .returning();

    return Response.json({ message: "Affiliate product updated", data: updated });
  } catch (error) {
    console.error("Error updating affiliate product:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Invalid input", error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.affiliateProduct.findFirst({
      where: and(eq(affiliateProduct.id, id), eq(affiliateProduct.authorId, session.session.userId)),
    });

    if (!existing) {
      return Response.json({ message: "Affiliate product not found" }, { status: 404 });
    }

    try {
      const imageUrl = existing.image ?? "";
      const marker = "/affiliates/";
      const idx = imageUrl.indexOf(marker);
      if (idx !== -1) {
        const path = imageUrl.substring(idx + marker.length);
        const { error: removeError } = await getSupabaseStorageClient()
          .storage.from("affiliates")
          .remove([path]);
        if (removeError) {
          console.warn("Failed to remove affiliate image from storage:", removeError);
        }
      }
    } catch (err) {
      console.warn("Error removing image from storage:", err);
    }

    await db
      .delete(affiliateProduct)
      .where(and(eq(affiliateProduct.id, id), eq(affiliateProduct.authorId, session.session.userId)));

    return Response.json({ message: "Affiliate product deleted" });
  } catch (error) {
    console.error("Error deleting affiliate product:", error);
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
