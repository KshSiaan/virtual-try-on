import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tryon } from "@/db/schema/tryon-schema";
import { createTryonSchema } from "@/lib/zod/tryon";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const getTryonQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsedQuery = getTryonQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      q: url.searchParams.get("q") ?? "",
    });

    const { page, limit, q } = parsedQuery;
    const offset = (page - 1) * limit;

    const filters = [eq(tryon.authorId, session.session.userId)];
    if (q) {
      filters.push(ilike(tryon.name, `%${q}%`));
    }

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(tryon)
        .where(and(...filters))
        .orderBy(desc(tryon.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(tryon).where(and(...filters)),
    ]);

    return Response.json({
      message: "Try-on items fetched successfully",
      data: items,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.total ?? 0,
        hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    console.error("Error fetching try-on items:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid query parameters", error: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authorId = session.session.userId;
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true";
    const type = formData.get("type") as string;
    const size = formData.get("size") as string;
    const fit = formData.get("fit") as string;
    const chest = formData.get("chest") as string;
    const shoulder = formData.get("shoulder") as string;
    const sleeve = formData.get("sleeve") as string;
    const waist = formData.get("waist") as string;
    const rise = formData.get("rise") as string;
    const inseam = formData.get("inseam") as string;
    const head = formData.get("head") as string;
    const shoe = formData.get("shoe") as string;
    const imageFile = formData.get("image") as File | null;

    const validatedData = createTryonSchema.parse({
      name,
      description,
      isPublic,
      type,
      size,
      fit,
      chest,
      shoulder,
      sleeve,
      waist,
      rise,
      inseam,
      head,
      shoe,
    });

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const fileName = `${authorId}_${timestamp}_${uniqueId}.${fileExt}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await getSupabaseStorageClient()
        .storage.from("tryon")
        .upload(`${authorId}/${fileName}`, buffer, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data: publicUrlData } = getSupabaseStorageClient()
        .storage.from("tryon")
        .getPublicUrl(`${authorId}/${fileName}`);

      imageUrl = publicUrlData.publicUrl;
    }

    if (!imageUrl) {
      throw new Error("Image upload is required");
    }

    const newTryonItem = await db
      .insert(tryon)
      .values({
        id: uuidv4(),
        authorId,
        name: validatedData.name,
        description: validatedData.description || null,
        isPublic: validatedData.isPublic,
        image: imageUrl,
        type: validatedData.type || null,
        size: validatedData.size || null,
        fit: validatedData.fit || null,
        chest: validatedData.chest || null,
        shoulder: validatedData.shoulder || null,
        sleeve: validatedData.sleeve || null,
        waist: validatedData.waist || null,
        rise: validatedData.rise || null,
        inseam: validatedData.inseam || null,
        head: validatedData.head || null,
        shoe: validatedData.shoe || null,
      })
      .returning();

    return Response.json(
      {
        message: "Try-on item created successfully",
        data: newTryonItem[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating try-on item:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Validation failed", error: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}