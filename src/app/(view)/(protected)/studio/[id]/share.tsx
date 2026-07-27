"use client";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";

export default function ShareButton({ caption }: { caption: string }) {
  return (
    <Button
      variant="outline"
      className="absolute bottom-4 right-4"
      onClick={() => {
        //check in native share works. If not fallback to copying a link to clipboard
        if (navigator.share) {
          navigator.share({
            title: caption || "Studio Try-on Result",
            url: window.location.href,
          });
        } else {
          // Fallback to copying link to clipboard
          navigator.clipboard.writeText(window.location.href);
        }
      }}
    >
      <Share2Icon />
    </Button>
  );
}
