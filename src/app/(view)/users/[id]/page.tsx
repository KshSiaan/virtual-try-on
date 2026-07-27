import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { studio } from "@/db/schema/studio-schema";
import { friends } from "@/db/schema/friends";
import { friendReq } from "@/db/schema/friend-request-schema";
import { and, eq } from "drizzle-orm";
import { EllipsisVerticalIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProfileActions from "./profile-actions";
import ShareProfileButton from "./share-profile-button";
import UserTrials from "./user-trials";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const header = await headers();
  const session = await auth.api.getSession({ headers: header });
  const viewerId = session?.session?.userId ?? null;

  if (viewerId === id) {
    redirect("/me");
  }

  const profileUser = await db.query.user.findFirst({
    where: eq(userTable.id, id),
    columns: { id: true, name: true, image: true, createdAt: true },
  });

  if (!profileUser) {
    return notFound();
  }

  const trials = await db
    .select()
    .from(studio)
    .where(eq(studio.authorId, id))
    .orderBy(studio.createdAt);

  let friendshipStatus:
    | "none"
    | "friends"
    | "request_sent"
    | "request_received" = "none";

  if (viewerId) {
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

    if (friendship) friendshipStatus = "friends";
    else if (sentReq) friendshipStatus = "request_sent";
    else if (receivedReq) friendshipStatus = "request_received";
  }

  const serializedTrials = trials.map((t) => ({
    id: t.id,
    resultImageUrl: t.resultImageUrl,
    caption: t.caption,
    model: t.model,
    size: t.size,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="py-24">
      <Avatar className="size-48 mx-auto">
        <AvatarImage
          src={
            profileUser.image ||
            `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${profileUser.name}`
          }
        />
        <AvatarFallback>
          {profileUser.name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>

      <div className="container mx-auto mt-12">
        <h1 className="text-3xl font-bold text-center">{profileUser.name}</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          Member since{" "}
          {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="w-full flex justify-center items-center gap-4 mt-12">
          {viewerId ? (
            <ProfileActions targetId={id} initialStatus={friendshipStatus} />
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign in to Add Friend</Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-48"
              align="start"
              side="right"
            >
              <ShareProfileButton userId={id} userName={profileUser.name} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator className="mt-12" />

      <div className="mt-12 container mx-auto">
        <h1 className="text-2xl font-bold">Studio Trials</h1>
        <UserTrials trials={serializedTrials} />
      </div>
    </div>
  );
}
