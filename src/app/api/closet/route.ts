
import { auth } from "@/lib/auth";
import { createClosetSchema } from "@/lib/zod/closet";
import { db } from "@/lib/db";
import { closet } from "@/db/schema/closet-schema";
import { wishlist } from "@/db/schema/wishlist-schema";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

const getClosetQuerySchema = z.object({
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
    const parsedQuery = getClosetQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      q: url.searchParams.get("q") ?? "",
    });

    const { page, limit, q } = parsedQuery;
    const offset = (page - 1) * limit;

    const filters = [eq(closet.authorId, session.session.userId)];
    if (q) {
      filters.push(ilike(closet.name, `%${q}%`));
    }

    const [items, totalResult] = await Promise.all([
      db
        .select({
          closetItem: closet,
          wishlistId: wishlist.id,
        })
        .from(closet)
        .leftJoin(
          wishlist,
          and(
            eq(wishlist.closetItemId, closet.id),
            eq(wishlist.authorId, session.session.userId)
          )
        )
        .where(and(...filters))
        .orderBy(desc(closet.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(closet)
        .where(and(...filters)),
    ]);

    const data = items.map((row) => ({
      ...row.closetItem,
      wish: row.wishlistId !== null,
    }));

    return Response.json({
      message: "Closet items fetched successfully",
      data,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.total ?? 0,
        hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    console.error("Error fetching closet items:", error);

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
    const user = await auth.api.getSession({
      headers: request.headers,
    });

    if (!user || !user.session?.userId) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const authorId = user.session.userId;
    const formData = await request.formData();

    // Extract fields from formData
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true";
    const type = formData.get("type") as string;
    const size = formData.get("size") as string;
    const fit = formData.get("fit") as string;
    const chest = formData.get("chest") as string;
    const shoulder = formData.get("shoulder") as string;
    const sleeve = formData.get("sleeve") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate with Zod
    const validatedData = createClosetSchema.parse({
      name,
      description,
      isPublic,
      type,
      size,
      fit,
      chest,
      shoulder,
      sleeve,
    });

    // Handle image upload to Supabase Storage
    let imageUrl = "";
    
    if (imageFile) {
      try {
        // Generate unique filename: userId_timestamp_uuid.ext
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const fileName = `${authorId}_${timestamp}_${uniqueId}.${fileExt}`;
        
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await getSupabaseStorageClient()
          .storage
          .from("closet")
          .upload(`${authorId}/${fileName}`, buffer, {
            contentType: imageFile.type,
            cacheControl: "3600",
            upsert: false,
          });
        
        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = getSupabaseStorageClient()
          .storage
          .from("closet")
          .getPublicUrl(`${authorId}/${fileName}`);
        
        imageUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        const message = uploadErr instanceof Error ? uploadErr.message : "Image upload failed";
        console.error("Image upload error:", uploadErr);
        throw new Error(message);
      }
    }
    
    if (!imageUrl) {
      throw new Error("Image upload is required");
    }

    // Insert into database
    const newClosetItem = await db.insert(closet).values({
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
    }).returning();

    return Response.json(
      {
        message: "Closet item created successfully",
        data: newClosetItem[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating closet item:", error);

    if (error instanceof Error) {
      // Zod validation error
      if (error.message.includes("Zod")) {
        return Response.json(
          { message: "Validation failed", error: error.message },
          { status: 400 }
        );
      }
      return Response.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}