import { and, eq, or } from "drizzle-orm";

import { wishlist } from "@/db/schema/wishlist-schema";
import { closet } from "@/db/schema/closet-schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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

        const wishlistItem = await db
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
            .where(and(eq(wishlist.id, id), eq(wishlist.authorId, session.session.userId)))
            .limit(1)
            .then((rows) => rows[0]);

        if (!wishlistItem) {
            return Response.json({ message: "Wishlist item not found" }, { status: 404 });
        }

        return Response.json({
            message: "Wishlist item fetched successfully",
            data: {
                id: wishlistItem.wishlistId,
                authorId: wishlistItem.authorId,
                closetItemId: wishlistItem.closetItemId,
                createdAt: wishlistItem.wishlistCreatedAt,
                updatedAt: wishlistItem.wishlistUpdatedAt,
                name: wishlistItem.closetItem.name,
                description: wishlistItem.closetItem.description,
                isPublic: wishlistItem.closetItem.isPublic,
                image: wishlistItem.closetItem.image,
                type: wishlistItem.closetItem.type,
                size: wishlistItem.closetItem.size,
                fit: wishlistItem.closetItem.fit,
                chest: wishlistItem.closetItem.chest,
                shoulder: wishlistItem.closetItem.shoulder,
                sleeve: wishlistItem.closetItem.sleeve,
                url: null,
                priority: null,
            },
        });
    } catch (error) {
        console.error("Error fetching wishlist item:", error);

        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }

        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    await params;
    return Response.json(
        { message: "PATCH is not supported for wishlist likes" },
        { status: 405 },
    );
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

        const existing = await db.query.wishlist.findFirst({
            where: and(
                eq(wishlist.authorId, session.session.userId),
                or(eq(wishlist.id, id), eq(wishlist.closetItemId, id)),
            ),
        });

        if (!existing) {
            return Response.json({ message: "Wishlist item not found" }, { status: 404 });
        }

        await db.delete(wishlist).where(eq(wishlist.id, existing.id));

        return Response.json({ message: "Wishlist item removed successfully" });
    } catch (error) {
        console.error("Error deleting wishlist item:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
