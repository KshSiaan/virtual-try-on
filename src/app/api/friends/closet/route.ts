import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/db/schema/auth-schema";
import { closet } from "@/db/schema/closet-schema";
import { friends } from "@/db/schema/friends";
import { wishlist } from "@/db/schema/wishlist-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;
        const url = new URL(request.url);
        const { page, limit } = querySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            limit: url.searchParams.get("limit") ?? undefined,
        });
        const offset = (page - 1) * limit;

        // Collect friend IDs from both sides of the symmetric friendship
        const [asA, asB] = await Promise.all([
            db.select({ id: friends.userBId }).from(friends).where(eq(friends.userAId, userId)),
            db.select({ id: friends.userAId }).from(friends).where(eq(friends.userBId, userId)),
        ]);

        const friendIds = [...asA, ...asB].map((r) => r.id);

        if (friendIds.length === 0) {
            return Response.json({
                message: "Friends' closet fetched",
                data: [],
                pagination: { page, limit, total: 0, hasMore: false },
            });
        }

        const filter = and(inArray(closet.authorId, friendIds), eq(closet.isPublic, true));

        const [items, totalResult] = await Promise.all([
            db
                .select({
                    closetItem: closet,
                    authorId: userTable.id,
                    authorName: userTable.name,
                    authorImage: userTable.image,
                    wishlistId: wishlist.id,
                })
                .from(closet)
                .innerJoin(userTable, eq(closet.authorId, userTable.id))
                .leftJoin(
                    wishlist,
                    and(eq(wishlist.closetItemId, closet.id), eq(wishlist.authorId, userId)),
                )
                .where(filter)
                .orderBy(desc(closet.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(closet).where(filter),
        ]);

        const data = items.map((row) => ({
            ...row.closetItem,
            author: {
                id: row.authorId,
                name: row.authorName,
                image: row.authorImage,
            },
            wish: row.wishlistId !== null,
        }));

        return Response.json({
            message: "Friends' closet fetched",
            data,
            pagination: {
                page,
                limit,
                total: totalResult[0]?.total ?? 0,
                hasMore: offset + items.length < (totalResult[0]?.total ?? 0),
            },
        });
    } catch (error) {
        console.error("Error fetching friends' closet:", error);
        if (error instanceof z.ZodError) {
            return Response.json({ message: "Invalid query parameters", error: error.flatten() }, { status: 400 });
        }
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
