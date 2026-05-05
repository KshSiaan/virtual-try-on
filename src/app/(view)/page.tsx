import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartIcon, Share2Icon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Page() {
  return (
    <div className="grid lg:grid-cols-5 p-6 gap-6 items-start h-full">
      <section className="lg:col-span-4 order-2 lg:order-1">
        <h1 className="font-bold text-xl pb-4 mb-4">Social Feed</h1>
        <div className="grid lg:grid-cols-3 gap-6 w-full h-full">
          {Array.from({ length: 5 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Card key={i} className="gap-0 pb-4">
              <CardHeader className="flex justify-start items-center border-b">
                <Avatar className="size-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/adventurer/svg?eyebrows=variant02&eyes=variant17&hairColor=592454,796a45,85c2c6&skinColor=ecad80&seed=Chase`}
                  />
                  <AvatarFallback>UI</AvatarFallback>
                </Avatar>
                <CardTitle className="ml-4 text-sm">Chase</CardTitle>
              </CardHeader>
              <CardContent className=" p-0 flex justify-center items-center h-[40dvh]">
                <Image
                  className="object-contain w-full h-full"
                  height={400}
                  width={400}
                  alt="placeholder"
                  src={"https://placehold.co/1000x800/png"}
                />
              </CardContent>
              <CardContent className="border-t p-6 space-y-2">
                <h3 className="text-base font-semibold">Relaxed linen shirt</h3>
                <p className="text-muted-foreground">Shirt / top</p>
                <div className=" space-x-2 space-y-2">
                  <Badge variant={"outline"}>S</Badge>
                  <Badge variant={"outline"}>L</Badge>
                  <Badge variant={"outline"}>XL</Badge>
                  <Badge variant={"outline"}>XXL</Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-between items-center gap-2">
                <Button size={"icon"} variant={"ghost"}>
                  <HeartIcon />
                </Button>
                <div className="flex items-center gap-2">
                  <Button size={"icon"} variant={"ghost"}>
                    <ShoppingCartIcon />
                  </Button>
                  <Button size={"icon"} variant={"ghost"}>
                    <Share2Icon />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
      <div className="lg:col-span-1 self-start h-full order-1 lg:order-2">
        <div className="sticky top-30">
          <h1 className="font-bold text-base pb-4">Filter (0)</h1>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button>Public</Button>
              <Button variant={"outline"}>Private (Friends)</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
