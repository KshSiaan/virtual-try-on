import { studio } from "@/db/schema/studio-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
export async function GET(req: Request) {

    const user = await auth.api.getSession({
        headers: req.headers,
    });
    if (!user?.session.token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const trials = await db
        .select({
            id: studio.id,
            authorId: studio.authorId,
            tryonId: studio.tryonId,
            resultImageUrl: studio.resultImageUrl,
            caption: studio.caption,
            model: studio.model,
            size: studio.size,
            status: studio.status,
            createdAt: studio.createdAt,
            updatedAt: studio.updatedAt,
        })
        .from(studio)
        .where(eq(studio.authorId, user.user.id))
        .orderBy(studio.createdAt);
    return new Response(
        JSON.stringify({
            message: "Successfully fetched studio trials",
            trials,
        }),
    )
}