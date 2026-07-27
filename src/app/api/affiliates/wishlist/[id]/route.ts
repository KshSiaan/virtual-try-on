import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { affiliateWishlist } from "@/db/schema/affiliate-wishlist-schema";
import { and, eq, or } from "drizzle-orm";

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
    const authorId = session.session.userId;

    const existing = await db.query.affiliateWishlist.findFirst({
      where: and(
        eq(affiliateWishlist.authorId, authorId),
        or(
          eq(affiliateWishlist.id, id),
          eq(affiliateWishlist.affiliateProductId, id),
        ),
      ),
    });

    if (!existing) {
      return Response.json({ message: "Wishlist item not found" }, { status: 404 });
    }

    await db.delete(affiliateWishlist).where(eq(affiliateWishlist.id, existing.id));

    return Response.json({ message: "Removed from wishlist" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
