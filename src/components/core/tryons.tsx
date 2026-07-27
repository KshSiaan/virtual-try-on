import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon, Share2Icon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
export default function Tryons({ select }: { select?: boolean }) {
  return Array.from({ length: 5 }, (_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
    <Card key={i} className="gap-0 py-3 pb-6">
      <CardContent className=" p-0 flex justify-center items-center h-[40dvh] rounded-lg!">
        <Image
          className="object-contain w-full h-full rounded-lg!"
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
      {select ? (
        <CardFooter className=" flex justify-between items-center gap-2">
          <Button className="w-full">Select Try-on</Button>
        </CardFooter>
      ) : (
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
      )}
    </Card>
  ));
}
