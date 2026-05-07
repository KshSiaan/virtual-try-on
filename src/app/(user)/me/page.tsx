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
import {
  Edit3Icon,
  EllipsisVerticalIcon,
  LogOutIcon,
  Share2Icon,
} from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Controller from "./controller";
import Link from "next/link";

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
      <Avatar className="size-48 mx-auto">
        <AvatarImage
          src={`https://api.dicebear.com/9.x/adventurer/svg?eyebrows=variant02&eyes=variant17&hairColor=592454,796a45,85c2c6&skinColor=ecad80&seed=Chase`}
        />
        <AvatarFallback>UI</AvatarFallback>
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
              <DropdownMenuItem>
                Share Profile
                <DropdownMenuShortcut>
                  <Share2Icon className="mr-2 h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
