import { auth } from "@/lib/auth";
import { getSupabaseStorageClient } from "@/lib/supabase";
import { z } from "zod";

export async function GET(request: Request) {
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

        const supabase = getSupabaseStorageClient();

        // Fetch both sides of the conversation in parallel
        const [sent, received] = await Promise.all([
            supabase
                .from("messages")
                .select("*")
                .eq("sender_id", userId)
                .eq("receiver_id", friendId),
            supabase
                .from("messages")
                .select("*")
                .eq("sender_id", friendId)
                .eq("receiver_id", userId),
        ]);

        if (sent.error) {
            return Response.json({ message: sent.error.message }, { status: 500 });
        }
        if (received.error) {
            return Response.json({ message: received.error.message }, { status: 500 });
        }

        const data = [...(sent.data ?? []), ...(received.data ?? [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return Response.json({ message: "Messages fetched", data });
    } catch (error) {
        console.error("Error fetching messages:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}

const sendMessageSchema = z.object({
    receiverId: z.string().min(1),
    text: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.session?.userId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const parse = sendMessageSchema.safeParse(body);
        if (!parse.success) {
            return Response.json(
                { message: "Invalid input", error: parse.error.flatten() },
                { status: 400 }
            );
        }

        const { receiverId, text } = parse.data;
        const senderId = session.session.userId;

        const supabase = getSupabaseStorageClient();

        const { data, error } = await supabase
            .from("messages")
            .insert({ sender_id: senderId, receiver_id: receiverId, text })
            .select()
            .single();

        if (error) {
            return Response.json({ message: error.message }, { status: 500 });
        }

        return Response.json({ message: "Message sent", data }, { status: 201 });
    } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof Error) {
            return Response.json({ message: error.message }, { status: 500 });
        }
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}
