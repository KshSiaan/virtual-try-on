import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { Edit2Icon, EllipsisVerticalIcon, Share2Icon } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Controller from "./controller";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import UploadAvatar from "./upload-avatar";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import Trials from "./trials";
import Share from "./share";

export default async function Page() {
  const header = await headers();
  const me = await auth.api.getSession({
    headers: header,
  });

  if (!me?.session.token) {
    return notFound();
  }
  return (
    <div className="py-24">
      <Avatar className="size-48 mx-auto relative overflow-visible">
        <AvatarImage
          src={
            me.user?.image ||
            `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${me.user?.name}`
          }
        />
        <AvatarFallback>UI</AvatarFallback>
        <Suspense>
          <UploadAvatar />
        </Suspense>
      </Avatar>
      <div className="container mx-auto mt-12">
        <h1 className="text-3xl font-bold text-center">{me?.user?.name}</h1>
        <p className="text-center text-muted-foreground">{me?.user?.email}</p>
        <div className="w-full flex justify-center items-center gap-4 mt-12">
          <Controller data={me?.user} />
          {me?.user?.role === "admin" && (
            <Button variant={"outline"} asChild>
              <Link href={"/admin/dashboard"}>Admin Dashboard</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"icon"}>
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-48"
              align="start"
              side="right"
            >
              <Share me={me?.user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator className="mt-12" />
      <div className="mt-12 container mx-auto">
        <h1 className="text-2xl font-bold">Studio Trials</h1>
        <div className="grid grid-cols-3 gap-6 pt-12">
          <Trials />
        </div>
      </div>
    </div>
  );
}
