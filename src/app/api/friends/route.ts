import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friends } from "@/db/schema/friends";
import { user as userTable } from "@/db/schema/auth-schema";
import { and, desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;

        // Friends can be on either side of the sorted pair — fetch both
        const [asA, asB] = await Promise.all([
            db.select({ friendship: friends, friend: userTable })
                .from(friends)
                .innerJoin(userTable, eq(friends.userBId, userTable.id))
                .where(eq(friends.userAId, userId))
                .orderBy(desc(friends.createdAt)),

            db.select({ friendship: friends, friend: userTable })
                .from(friends)
                .innerJoin(userTable, eq(friends.userAId, userTable.id))
                .where(eq(friends.userBId, userId))
                .orderBy(desc(friends.createdAt)),
        ]);

        const data = [...asA, ...asB]
            .sort((a, b) => new Date(b.friendship.createdAt).getTime() - new Date(a.friendship.createdAt).getTime())
            .map((r) => ({
                friendshipId: r.friendship.id,
                since: r.friendship.createdAt,
                user: {
                    id: r.friend.id,
                    name: r.friend.name,
                    image: r.friend.image,
                },
            }));

        return Response.json({ message: "Friends fetched", data });
    } catch (error) {
        console.error("Error fetching friends:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;
        const url = new URL(request.url);
        const friendId = url.searchParams.get("friendId");

        if (!friendId) {
            return Response.json({ message: "Missing friendId" }, { status: 400 });
        }

        // IDs are stored sorted — compute the canonical pair
        const userAId = userId < friendId ? userId : friendId;
        const userBId = userId < friendId ? friendId : userId;

        const existing = await db.query.friends.findFirst({
            where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)),
        });

        if (!existing) {
            return Response.json({ message: "Friendship not found" }, { status: 404 });
        }

        await db.delete(friends).where(eq(friends.id, existing.id));

        return Response.json({ message: "Friend removed" });
    } catch (error) {
        console.error("Error removing friend:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
