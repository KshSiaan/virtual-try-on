import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendReq } from "@/db/schema/friend-request-schema";
import { user as userTable } from "@/db/schema/auth-schema";
import { v4 as uuidv4 } from "uuid";
import { and, desc, eq } from "drizzle-orm";
import { friends } from "@/db/schema/friends";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const senderId = session.session.userId;

        const contentType = request.headers.get("content-type") || "";
        let friendID: string | undefined;
        if (contentType.includes("application/json")) {
            const body = await request.json().catch(() => ({}));
            friendID = typeof body?.friendID === "string" ? body.friendID : undefined;
        } else {
            const form = await request.formData();
            const raw = form.get("friendID");
            if (typeof raw === "string") friendID = raw;
        }

        if (!friendID) {
            return Response.json({ message: "Invalid input" }, { status: 400 });
        }

        if (friendID === senderId) {
            return Response.json({ message: "Cannot send friend request to yourself" }, { status: 400 });
        }

        // check existing requests (either direction)
        const existingSent = await db.query.friendReq.findFirst({
            where: and(eq(friendReq.senderID, senderId), eq(friendReq.receiverID, friendID)),
        });

        if (existingSent) {
            return Response.json({ message: "Friend request already sent", data: existingSent });
        }

        const existingOther = await db.query.friendReq.findFirst({
            where: and(eq(friendReq.senderID, friendID), eq(friendReq.receiverID, senderId)),
        });

        if (existingOther) {
            // there is an incoming request from the other user
            return Response.json({ message: "You have an incoming friend request from this user", data: existingOther });
        }

        const [created] = await db.insert(friendReq).values({
            id: uuidv4(),
            senderID: senderId,
            receiverID: friendID,
            status: "pending",
        }).returning();

        return Response.json({ message: "Friend request sent", data: created }, { status: 201 });
    } catch (error) {
        console.error("Error creating friend request:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "received";

        if (type === "sent") {
            const rows = await db.select({ req: friendReq, other: userTable })
                .from(friendReq)
                .innerJoin(userTable, eq(friendReq.receiverID, userTable.id))
                .where(eq(friendReq.senderID, userId))
                .orderBy(desc(friendReq.createdAt));

            const data = rows.map((r) => ({
                id: r.req.id,
                senderID: r.req.senderID,
                receiverID: r.req.receiverID,
                status: r.req.status,
                createdAt: r.req.createdAt,
                updatedAt: r.req.updatedAt,
                user: {
                    id: r.other.id,
                    name: r.other.name,
                    image: r.other.image,
                },
            }));

            return Response.json({ message: "Sent friend requests fetched", data });
        }

        // default: received
        const rows = await db.select({ req: friendReq, other: userTable })
            .from(friendReq)
            .innerJoin(userTable, eq(friendReq.senderID, userTable.id))
            .where(eq(friendReq.receiverID, userId))
            .orderBy(desc(friendReq.createdAt));

        const data = rows.map((r) => ({
            id: r.req.id,
            senderID: r.req.senderID,
            receiverID: r.req.receiverID,
            status: r.req.status,
            createdAt: r.req.createdAt,
            updatedAt: r.req.updatedAt,
            user: {
                id: r.other.id,
                name: r.other.name,
                image: r.other.image,
            },
        }));

        return Response.json({ message: "Received friend requests fetched", data });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await request.json().catch(() => ({}));
            const requestId = typeof body?.requestId === "string" ? body.requestId : undefined;
            const senderId = typeof body?.senderId === "string" ? body.senderId : undefined;

            if (requestId) {
                const existing = await db.query.friendReq.findFirst({
                    where: and(eq(friendReq.id, requestId), eq(friendReq.receiverID, userId)),
                });
                if (!existing) return Response.json({ message: "Friend request not found" }, { status: 404 });
                if (existing.status !== "pending") return Response.json({ message: "Friend request is not pending" }, { status: 400 });

                const userAId = existing.senderID < existing.receiverID ? existing.senderID : existing.receiverID;
                const userBId = existing.senderID < existing.receiverID ? existing.receiverID : existing.senderID;

                const existingFriend = await db.query.friends.findFirst({
                    where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)),
                });

                let createdFriend = null;
                if (!existingFriend) {
                    const [ins] = await db.insert(friends).values({ id: uuidv4(), userAId, userBId }).returning();
                    createdFriend = ins;
                }

                const [updated] = await db.update(friendReq).set({ status: "accepted" }).where(eq(friendReq.id, existing.id)).returning();
                return Response.json({ message: "Friend request accepted", data: { friend: createdFriend, request: updated } });
            }

            if (senderId) {
                const existing = await db.query.friendReq.findFirst({
                    where: and(eq(friendReq.senderID, senderId), eq(friendReq.receiverID, userId)),
                });
                if (!existing) return Response.json({ message: "Friend request not found" }, { status: 404 });
                if (existing.status !== "pending") return Response.json({ message: "Friend request is not pending" }, { status: 400 });

                const userAId = existing.senderID < existing.receiverID ? existing.senderID : existing.receiverID;
                const userBId = existing.senderID < existing.receiverID ? existing.receiverID : existing.senderID;

                const existingFriend = await db.query.friends.findFirst({
                    where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)),
                });

                let createdFriend = null;
                if (!existingFriend) {
                    const [ins] = await db.insert(friends).values({ id: uuidv4(), userAId, userBId }).returning();
                    createdFriend = ins;
                }

                const [updated] = await db.update(friendReq).set({ status: "accepted" }).where(eq(friendReq.id, existing.id)).returning();
                return Response.json({ message: "Friend request accepted", data: { friend: createdFriend, request: updated } });
            }

            return Response.json({ message: "Invalid input" }, { status: 400 });
        }

        // form-data branch
        const form = await request.formData();
        const r = form.get("requestId");
        const s = form.get("senderId");
        if (typeof r === "string") {
            const existing = await db.query.friendReq.findFirst({ where: and(eq(friendReq.id, r), eq(friendReq.receiverID, userId)) });
            if (!existing) return Response.json({ message: "Friend request not found" }, { status: 404 });
            if (existing.status !== "pending") return Response.json({ message: "Friend request is not pending" }, { status: 400 });

            const userAId = existing.senderID < existing.receiverID ? existing.senderID : existing.receiverID;
            const userBId = existing.senderID < existing.receiverID ? existing.receiverID : existing.senderID;

            const existingFriend = await db.query.friends.findFirst({ where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)) });
            let createdFriend = null;
            if (!existingFriend) {
                const [ins] = await db.insert(friends).values({ id: uuidv4(), userAId, userBId }).returning();
                createdFriend = ins;
            }

            const [updated] = await db.update(friendReq).set({ status: "accepted" }).where(eq(friendReq.id, existing.id)).returning();
            return Response.json({ message: "Friend request accepted", data: { friend: createdFriend, request: updated } });
        }

        if (typeof s === "string") {
            const existing = await db.query.friendReq.findFirst({ where: and(eq(friendReq.senderID, s), eq(friendReq.receiverID, userId)) });
            if (!existing) return Response.json({ message: "Friend request not found" }, { status: 404 });
            if (existing.status !== "pending") return Response.json({ message: "Friend request is not pending" }, { status: 400 });

            const userAId = existing.senderID < existing.receiverID ? existing.senderID : existing.receiverID;
            const userBId = existing.senderID < existing.receiverID ? existing.receiverID : existing.senderID;

            const existingFriend = await db.query.friends.findFirst({ where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)) });
            let createdFriend = null;
            if (!existingFriend) {
                const [ins] = await db.insert(friends).values({ id: uuidv4(), userAId, userBId }).returning();
                createdFriend = ins;
            }

            const [updated] = await db.update(friendReq).set({ status: "accepted" }).where(eq(friendReq.id, existing.id)).returning();
            return Response.json({ message: "Friend request accepted", data: { friend: createdFriend, request: updated } });
        }

        return Response.json({ message: "Invalid input" }, { status: 400 });
    } catch (error) {
        console.error("Error accepting friend request:", error);
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
        const requestId = url.searchParams.get("requestId");

        if (!requestId) {
            return Response.json({ message: "Missing requestId" }, { status: 400 });
        }

        const existing = await db.query.friendReq.findFirst({
            where: eq(friendReq.id, requestId),
        });

        if (!existing) {
            return Response.json({ message: "Friend request not found" }, { status: 404 });
        }

        // Receiver declines → mark as rejected
        if (existing.receiverID === userId) {
            if (existing.status !== "pending") {
                return Response.json({ message: "Friend request is not pending" }, { status: 400 });
            }
            const [updated] = await db.update(friendReq)
                .set({ status: "rejected" })
                .where(eq(friendReq.id, requestId))
                .returning();
            return Response.json({ message: "Friend request declined", data: updated });
        }

        // Sender cancels → delete the record
        if (existing.senderID === userId) {
            await db.delete(friendReq).where(eq(friendReq.id, requestId));
            return Response.json({ message: "Friend request canceled" });
        }

        return Response.json({ message: "Forbidden" }, { status: 403 });
    } catch (error) {
        console.error("Error handling friend request:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}