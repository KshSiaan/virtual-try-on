import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadIcon, SparklesIcon, Share2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Tryons from "@/components/core/tryons";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  return (
    <div className="h-full w-full p-6">
      <h2 className="text-lg font-bold">Compose Outfit (Multi-Item Try On)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Build a full look by combining tops, bottoms, and layers in one pass.
      </p>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-300" />
            <Label className="">Add Try-On Photos</Label>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="relative border-2 border-dashed border-zinc-500/40 shadow-none ring-0">
                <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center font-semibold">
                  <div className="p-3">
                    <UploadIcon className="size-6 " />
                  </div>
                  Select Try on Photo from Active tryons
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="min-w-[70dvw] min-h-[70dvh]">
              <DialogHeader>
                <DialogTitle>Select a Try-on Photo</DialogTitle>
              </DialogHeader>

              <div className="overflow-y-scroll max-h-[65dvh]">
                <div className="grid grid-cols-3 gap-4 p-6 w-full">
                  <Tryons select />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-muted-foreground">
            Tip: include one full-body front photo and a side angle for better
            fit realism.
          </p>
          <Separator />
          <Label className="">Outfit Caption</Label>
          <Textarea placeholder="Type here.." className="min-h-24" />
          <Separator />
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-300" />
            <Label className="">Clothing for this try-on</Label>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="relative border-2 border-dashed border-zinc-500/40 shadow-none ring-0">
                <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center font-semibold">
                  <div className="p-3">
                    <UploadIcon className="size-6 " />
                  </div>
                  Select Clothings from My Closet or Recommendations
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="min-w-[70dvw] min-h-[70dvh]">
              <DialogHeader>
                <DialogTitle>Select Clothing Items</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-scroll max-h-[65dvh]">
                <div className="grid grid-cols-3 gap-4 p-6 w-full">
                  <Tryons select />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="space-x-4 flex justify-between">
          <Button>Submit & View Result</Button>
          <Button variant={"outline"} disabled>
            <Share2Icon />
            Share with Friends
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
