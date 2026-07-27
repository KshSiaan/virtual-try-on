import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendReq } from "@/db/schema/friend-request-schema";
import { and, count, eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.session.userId;

        const [result] = await db
            .select({ count: count() })
            .from(friendReq)
            .where(and(eq(friendReq.receiverID, userId), eq(friendReq.status, "pending")));

        return Response.json({ count: result?.count ?? 0 });
    } catch (error) {
        console.error("Error counting friend requests:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
