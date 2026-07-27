import { db } from "@/lib/db";
import { affiliateProduct } from "@/db/schema/affiliate-schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

const getQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  q: z.string().trim().optional().default(""),
  type: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { page, limit, q, type } = getQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      q: url.searchParams.get("q") ?? "",
      type: url.searchParams.get("type") ?? undefined,
    });

    const offset = (page - 1) * limit;
    const filters = [
      eq(affiliateProduct.isActive, true),
      ...(q ? [ilike(affiliateProduct.name, `%${q}%`)] : []),
      ...(type ? [eq(affiliateProduct.type, type)] : []),
    ];

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(affiliateProduct)
        .where(and(...filters))
        .orderBy(desc(affiliateProduct.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(affiliateProduct)
        .where(and(...filters)),
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
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Invalid query parameters" }, { status: 400 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
