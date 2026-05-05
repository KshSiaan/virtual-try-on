import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { UserRoundPenIcon } from "lucide-react";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-20 bg-background">
        <div className="h-14 flex justify-between items-center px-4 gap-4 w-full">
          <Image
            height={64}
            width={64}
            alt="logo"
            src={"/logo.svg"}
            className="size-8"
          />
          <div className="">
            <Link href={"/me"} className="flex items-center gap-2 group">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/adventurer/svg?eyebrows=variant02&eyes=variant17&hairColor=592454,796a45,85c2c6&skinColor=ecad80&seed=Chase`}
                />
                <AvatarFallback>UI</AvatarFallback>
              </Avatar>
              {/* <span className="text-sm font-semibold text-primary group-hover:underline">
            Profile
          </span> */}
            </Link>
          </div>
        </div>
        <div className="border-b w-full p-2 flex justify-between items-center gap-4">
          <div className="gap-2 flex">
            <Button variant={"link"} asChild>
              <Link href={"/"}>Feed</Link>
            </Button>
            <Button variant={"link"} asChild>
              <Link href={"/closet"}>Closet</Link>
            </Button>
            <Button variant={"link"} asChild>
              <Link href={"tryon"}>Try-On Photos</Link>
            </Button>
          </div>
          <Button asChild>
            <Link href={"/studio"}>
              Try-On Studio <UserRoundPenIcon />
            </Link>
          </Button>
        </div>
      </nav>
      <div className="h-26"></div>
    </>
  );
}
