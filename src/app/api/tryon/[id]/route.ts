import { and, eq } from "drizzle-orm";

import { tryon } from "@/db/schema/tryon-schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { createTryonSchema } from "@/lib/zod/tryon";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tryonItem = await db.query.tryon.findFirst({
      where: and(eq(tryon.id, id), eq(tryon.authorId, session.session.userId)),
    });

    if (!tryonItem) {
      return Response.json({ message: "Try-on item not found" }, { status: 404 });
    }

    return Response.json({
      message: "Try-on item fetched successfully",
      data: tryonItem,
    });
  } catch (error) {
    console.error("Error fetching try-on item:", error);

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

    const existing = await db.query.tryon.findFirst({
      where: and(eq(tryon.id, id), eq(tryon.authorId, session.session.userId)),
    });

    if (!existing) {
      return Response.json({ message: "Try-on item not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const name = (formData.get("name") as string) ?? undefined;
    const description = (formData.get("description") as string) ?? undefined;
    const isPublicRaw = formData.get("isPublic");
    const isPublic = isPublicRaw === null ? undefined : isPublicRaw === "true";
    const type = (formData.get("type") as string) ?? undefined;
    const size = (formData.get("size") as string) ?? undefined;
    const fit = (formData.get("fit") as string) ?? undefined;
    const chest = (formData.get("chest") as string) ?? undefined;
    const shoulder = (formData.get("shoulder") as string) ?? undefined;
    const sleeve = (formData.get("sleeve") as string) ?? undefined;
    const waist = (formData.get("waist") as string) ?? undefined;
    const rise = (formData.get("rise") as string) ?? undefined;
    const inseam = (formData.get("inseam") as string) ?? undefined;
    const head = (formData.get("head") as string) ?? undefined;
    const shoe = (formData.get("shoe") as string) ?? undefined;
    const imageFile = formData.get("image") as File | null;

    const partialSchema = createTryonSchema.partial();
    const validated = partialSchema.parse({
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(size !== undefined ? { size } : {}),
      ...(fit !== undefined ? { fit } : {}),
      ...(chest !== undefined ? { chest } : {}),
      ...(shoulder !== undefined ? { shoulder } : {}),
      ...(sleeve !== undefined ? { sleeve } : {}),
      ...(waist !== undefined ? { waist } : {}),
      ...(rise !== undefined ? { rise } : {}),
      ...(inseam !== undefined ? { inseam } : {}),
      ...(head !== undefined ? { head } : {}),
      ...(shoe !== undefined ? { shoe } : {}),
    });

    let imageUrl = existing.image;
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const fileName = `${session.session.userId}_${timestamp}_${uniqueId}.${fileExt}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await getSupabaseStorageClient()
          .storage
          .from("tryon")
          .upload(`${session.session.userId}/${fileName}`, buffer, {
            contentType: imageFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error(uploadError.message || "Upload failed");

        const { data: publicUrlData } = getSupabaseStorageClient()
          .storage
          .from("tryon")
          .getPublicUrl(`${session.session.userId}/${fileName}`);

        imageUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        const message = uploadErr instanceof Error ? uploadErr.message : "Image upload failed";
        console.error("Image upload error:", uploadErr);
        return Response.json({ message }, { status: 500 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description ?? null;
    if (validated.isPublic !== undefined) updateData.isPublic = validated.isPublic;
    if (validated.type !== undefined) updateData.type = validated.type ?? null;
    if (validated.size !== undefined) updateData.size = validated.size ?? null;
    if (validated.fit !== undefined) updateData.fit = validated.fit ?? null;
    if (validated.chest !== undefined) updateData.chest = validated.chest ?? null;
    if (validated.shoulder !== undefined) updateData.shoulder = validated.shoulder ?? null;
    if (validated.sleeve !== undefined) updateData.sleeve = validated.sleeve ?? null;
    if (validated.waist !== undefined) updateData.waist = validated.waist ?? null;
    if (validated.rise !== undefined) updateData.rise = validated.rise ?? null;
    if (validated.inseam !== undefined) updateData.inseam = validated.inseam ?? null;
    if (validated.head !== undefined) updateData.head = validated.head ?? null;
    if (validated.shoe !== undefined) updateData.shoe = validated.shoe ?? null;
    if (imageUrl) updateData.image = imageUrl;

    const [updated] = await db
      .update(tryon)
      .set(updateData)
      .where(and(eq(tryon.id, id), eq(tryon.authorId, session.session.userId)))
      .returning();

    return Response.json({ message: "Try-on item updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating try-on item:", error);
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

    const existing = await db.query.tryon.findFirst({
      where: and(eq(tryon.id, id), eq(tryon.authorId, session.session.userId)),
    });

    if (!existing) {
      return Response.json({ message: "Try-on item not found" }, { status: 404 });
    }

    try {
      const imageUrl = existing.image || "";
      const marker = "/tryon/";
      const idx = imageUrl.indexOf(marker);
      if (idx !== -1) {
        const path = imageUrl.substring(idx + marker.length);
        const { error: removeError } = await getSupabaseStorageClient()
          .storage
          .from("tryon")
          .remove([path]);
        if (removeError) {
          console.warn("Failed to remove try-on image from storage:", removeError);
        }
      }
    } catch (err) {
      console.warn("Error removing image from storage:", err);
    }

    await db.delete(tryon).where(and(eq(tryon.id, id), eq(tryon.authorId, session.session.userId)));

    return Response.json({ message: "Try-on item deleted successfully" });
  } catch (error) {
    console.error("Error deleting try-on item:", error);
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
