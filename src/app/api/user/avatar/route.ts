import { auth } from "@/lib/auth";
import {getSupabaseStorageClient} from "@/lib/supabase"
import sharp from "sharp";
export async function POST(req: Request) {
    const isAuthenticated = await auth.api.getSession({
        headers: req.headers,
    });

    if (!isAuthenticated?.session.token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    const formData = await req.formData();
    const file = formData.get("avatar") as File;
        if (!file) {
        return new Response(JSON.stringify({ message: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
        });
    }

    //compress image using sharp
    const buffer = await file.arrayBuffer();
    const compressedBuffer = await sharp(buffer)
        .resize(200, 200, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
    const storage = getSupabaseStorageClient().storage.from("avatar");
    const avatarPath = `${isAuthenticated.user.id}/avatar.jpg`;
    const { error } = await storage.upload(avatarPath, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
    });
    if (error) {
        console.error("Failed to upload avatar:", error);
        return new Response(JSON.stringify({ message: "Failed to upload avatar" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    const url = storage.getPublicUrl(avatarPath).data.publicUrl;
    await auth.api.updateUser({
        body:{
            "image": url,
        },
        headers: req.headers,
    });
    return new Response(JSON.stringify({ message: "Avatar updated successfully", url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}