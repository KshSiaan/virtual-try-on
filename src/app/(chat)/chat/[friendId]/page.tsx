import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friends } from "@/db/schema/friends";
import { user as userTable } from "@/db/schema/auth-schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatView from "./chat-view";

export default async function FriendChatPage({
    params,
}: {
    params: Promise<{ friendId: string }>;
}) {
    const { friendId } = await params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.session?.userId) {
        redirect("/auth/signin");
    }

    const userId = session.session.userId;

    // Canonical pair: IDs are stored sorted
    const userAId = userId < friendId ? userId : friendId;
    const userBId = userId < friendId ? friendId : userId;

    const friendship = await db.query.friends.findFirst({
        where: and(eq(friends.userAId, userAId), eq(friends.userBId, userBId)),
    });

    if (!friendship) {
        redirect("/chat");
    }

    const [friend] = await db
        .select({ id: userTable.id, name: userTable.name, image: userTable.image })
        .from(userTable)
        .where(eq(userTable.id, friendId))
        .limit(1);

    if (!friend) {
        redirect("/chat");
    }

    return (
        <ChatView
            userId={userId}
            friendId={friendId}
            friendName={friend.name ?? "Unknown"}
            friendImage={friend.image}
        />
    );
}
