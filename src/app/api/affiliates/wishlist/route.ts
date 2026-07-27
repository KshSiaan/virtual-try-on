import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { affiliateWishlist } from "@/db/schema/affiliate-wishlist-schema";
import { affiliateProduct } from "@/db/schema/affiliate-schema";
import { v4 as uuidv4 } from "uuid";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

const getQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const { page, limit } = getQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });
    const offset = (page - 1) * limit;
    const authorId = session.session.userId;

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: affiliateWishlist.id,
          authorId: affiliateWishlist.authorId,
          affiliateProductId: affiliateWishlist.affiliateProductId,
          createdAt: affiliateWishlist.createdAt,
          product: affiliateProduct,
        })
        .from(affiliateWishlist)
        .innerJoin(
          affiliateProduct,
          eq(affiliateWishlist.affiliateProductId, affiliateProduct.id),
        )
        .where(eq(affiliateWishlist.authorId, authorId))
        .orderBy(desc(affiliateWishlist.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(affiliateWishlist)
        .where(eq(affiliateWishlist.authorId, authorId)),
    ]);

    const data = items.map((row) => ({
      id: row.id,
      authorId: row.authorId,
      affiliateProductId: row.affiliateProductId,
      createdAt: row.createdAt,
      product: row.product,
    }));

    return Response.json({
      message: "Affiliate wishlist fetched successfully",
      data,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.total ?? 0,
        hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid query parameters", error: error.flatten() },
        { status: 400 },
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
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parse = z.object({ affiliateProductId: z.string().min(1) }).safeParse(body);
    if (!parse.success) {
      return Response.json(
        { message: "Invalid input", error: parse.error.flatten() },
        { status: 400 },
      );
    }

    const { affiliateProductId } = parse.data;
    const authorId = session.session.userId;

    const product = await db.query.affiliateProduct.findFirst({
      where: and(eq(affiliateProduct.id, affiliateProductId), eq(affiliateProduct.isActive, true)),
    });

    if (!product) {
      return Response.json({ message: "Affiliate product not found" }, { status: 404 });
    }

    const existing = await db.query.affiliateWishlist.findFirst({
      where: and(
        eq(affiliateWishlist.authorId, authorId),
        eq(affiliateWishlist.affiliateProductId, affiliateProductId),
      ),
    });

    if (existing) {
      return Response.json({ message: "Already in wishlist", data: existing });
    }

    const [created] = await db
      .insert(affiliateWishlist)
      .values({ id: uuidv4(), authorId, affiliateProductId })
      .returning();

    return Response.json(
      { message: "Added to wishlist", data: created },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid input", error: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
