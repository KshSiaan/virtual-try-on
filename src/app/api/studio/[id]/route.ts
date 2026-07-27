import { closet, studio, studioClosetItem, tryon } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await db
    .select({
      studioId: studio.id,
      authorId: studio.authorId,
      tryonId: studio.tryonId,
      resultImageUrl: studio.resultImageUrl,
      caption: studio.caption,
      model: studio.model,
      size: studio.size,
      status: studio.status,
      createdAt: studio.createdAt,
      updatedAt: studio.updatedAt,
      tryonObject: {
        id: tryon.id,
        name: tryon.name,
        description: tryon.description,
        image: tryon.image,
        type: tryon.type,
        size: tryon.size,
        fit: tryon.fit,
        chest: tryon.chest,
        shoulder: tryon.shoulder,
        sleeve: tryon.sleeve,
        waist: tryon.waist,
        rise: tryon.rise,
        inseam: tryon.inseam,
        head: tryon.head,
        shoe: tryon.shoe,
      },
      closetObject: {
        id: closet.id,
        name: closet.name,
        description: closet.description,
        image: closet.image,
        type: closet.type,
        size: closet.size,
        fit: closet.fit,
        chest: closet.chest,
        shoulder: closet.shoulder,
        sleeve: closet.sleeve,
      },
      sortOrder: studioClosetItem.sortOrder,
    })
    .from(studio)
    .leftJoin(tryon, eq(studio.tryonId, tryon.id))
    .leftJoin(studioClosetItem, eq(studio.id, studioClosetItem.studioId))
    .leftJoin(closet, eq(studioClosetItem.closetItemId, closet.id))
    .where(eq(studio.id, id))
    .orderBy(studioClosetItem.sortOrder);

  const firstRow = rows[0];

  if (!firstRow) {
    return Response.json(
      { message: "Studio not found" },
      { status: 404 }
    );
  }

  const data = {
    id: firstRow.studioId,
    authorId: firstRow.authorId,
    tryonId: firstRow.tryonId,
    resultImageUrl: firstRow.resultImageUrl,
    caption: firstRow.caption,
    model: firstRow.model,
    size: firstRow.size,
    status: firstRow.status,
    createdAt: firstRow.createdAt,
    updatedAt: firstRow.updatedAt,
    tryon: firstRow.tryonObject,
    closetItems: rows
      .filter((row) => row.closetObject?.id)
      .map((row) => row.closetObject),
  };

  return Response.json({
    message: "Studio fetched successfully",
    data,
  });
}