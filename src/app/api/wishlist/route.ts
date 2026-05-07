import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlist } from "@/db/schema/wishlist-schema";
import { closet } from "@/db/schema/closet-schema";
import { v4 as uuidv4 } from "uuid";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

const getWishlistQuerySchema = z.object({
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
    const parsedQuery = getWishlistQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      q: url.searchParams.get("q") ?? "",
    });

    const { page, limit, q } = parsedQuery;
    const offset = (page - 1) * limit;

    const filters = [eq(wishlist.authorId, session.session.userId)];
    if (q) {
      filters.push(ilike(closet.name, `%${q}%`));
    }

    const [items, totalResult] = await Promise.all([
      db
        .select({
          wishlistId: wishlist.id,
          authorId: wishlist.authorId,
          closetItemId: wishlist.closetItemId,
          wishlistCreatedAt: wishlist.createdAt,
          wishlistUpdatedAt: wishlist.updatedAt,
          closetItem: closet,
        })
        .from(wishlist)
        .innerJoin(closet, eq(wishlist.closetItemId, closet.id))
        .where(and(...filters))
        .orderBy(desc(wishlist.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(wishlist)
        .innerJoin(closet, eq(wishlist.closetItemId, closet.id))
        .where(and(...filters)),
    ]);

    const data = items.map((row) => ({
      id: row.wishlistId,
      authorId: row.authorId,
      closetItemId: row.closetItemId,
      createdAt: row.wishlistCreatedAt,
      updatedAt: row.wishlistUpdatedAt,
      name: row.closetItem.name,
      description: row.closetItem.description,
      isPublic: row.closetItem.isPublic,
      image: row.closetItem.image,
      type: row.closetItem.type,
      size: row.closetItem.size,
      fit: row.closetItem.fit,
      chest: row.closetItem.chest,
      shoulder: row.closetItem.shoulder,
      sleeve: row.closetItem.sleeve,
      url: null,
      priority: null,
    }));

    return Response.json({
      message: "Wishlist items fetched successfully",
      data,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.total ?? 0,
        hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);

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

    let closetItemId: string | undefined;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      if (body && typeof body.closetItemId === "string") {
        closetItemId = body.closetItemId;
      }
    } else {
      const formData = await request.formData();
      const rawClosetItemId = formData.get("closetItemId");
      if (typeof rawClosetItemId === "string") {
        closetItemId = rawClosetItemId;
      }
    }

    const parse = z.object({ closetItemId: z.string().min(1) }).safeParse({
      closetItemId,
    });
    if (!parse.success) {
      return Response.json(
        { message: "Invalid input", error: parse.error.flatten() },
        { status: 400 }
      );
    }

    const authorId = session.session.userId;
    const validatedClosetItemId = parse.data.closetItemId;

    const closetItem = await db.query.closet.findFirst({
      where: and(
        eq(closet.id, validatedClosetItemId),
        eq(closet.authorId, authorId),
      ),
    });

    if (!closetItem) {
      return Response.json({ message: "Closet item not found" }, { status: 404 });
    }

    const existing = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.authorId, authorId),
        eq(wishlist.closetItemId, validatedClosetItemId),
      ),
    });

    if (existing) {
      return Response.json({
        message: "Already in wishlist",
        data: {
          id: existing.id,
          authorId: existing.authorId,
          closetItemId: existing.closetItemId,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
          name: closetItem.name,
          description: closetItem.description,
          isPublic: closetItem.isPublic,
          image: closetItem.image,
          type: closetItem.type,
          size: closetItem.size,
          fit: closetItem.fit,
          chest: closetItem.chest,
          shoulder: closetItem.shoulder,
          sleeve: closetItem.sleeve,
          url: null,
          priority: null,
        },
      });
    }

    const [created] = await db
      .insert(wishlist)
      .values({
        id: uuidv4(),
        authorId,
        closetItemId: validatedClosetItemId,
      })
      .returning();

    return Response.json(
      {
        message: "Wishlist item added successfully",
        data: {
          id: created.id,
          authorId: created.authorId,
          closetItemId: created.closetItemId,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          name: closetItem.name,
          description: closetItem.description,
          isPublic: closetItem.isPublic,
          image: closetItem.image,
          type: closetItem.type,
          size: closetItem.size,
          fit: closetItem.fit,
          chest: closetItem.chest,
          shoulder: closetItem.shoulder,
          sleeve: closetItem.sleeve,
          url: null,
          priority: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding wishlist item:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid input", error: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
