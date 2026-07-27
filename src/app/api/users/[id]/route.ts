import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { studio } from "@/db/schema/studio-schema";
import { friends } from "@/db/schema/friends";
import { friendReq } from "@/db/schema/friend-request-schema";
import { and, eq, or } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: request.headers });
  const viewerId = session?.session?.userId ?? null;

  const profileUser = await db.query.user.findFirst({
    where: eq(userTable.id, id),
    columns: { id: true, name: true, image: true, createdAt: true },
  });

  if (!profileUser) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  const trials = await db
    .select()
    .from(studio)
    .where(eq(studio.authorId, id))
    .orderBy(studio.createdAt);

  let friendshipStatus: "none" | "friends" | "request_sent" | "request_received" = "none";

  if (viewerId && viewerId !== id) {
    const userAId = viewerId < id ? viewerId : id;
    const userBId = viewerId < id ? id : viewerId;

    const [friendship, sentReq, receivedReq] = await Promise.all([
      db.query.friends.findFirst({
        where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)),
      }),
      db.query.friendReq.findFirst({
        where: and(
          eq(friendReq.senderID, viewerId),
          eq(friendReq.receiverID, id),
          eq(friendReq.status, "pending"),
        ),
      }),
      db.query.friendReq.findFirst({
        where: and(
          eq(friendReq.senderID, id),
          eq(friendReq.receiverID, viewerId),
          eq(friendReq.status, "pending"),
        ),
      }),
    ]);

    if (friendship) {
      friendshipStatus = "friends";
    } else if (sentReq) {
      friendshipStatus = "request_sent";
    } else if (receivedReq) {
      friendshipStatus = "request_received";
    }
  }

  return Response.json({
    user: profileUser,
    trials,
    friendshipStatus,
    isOwnProfile: viewerId === id,
  });
}
