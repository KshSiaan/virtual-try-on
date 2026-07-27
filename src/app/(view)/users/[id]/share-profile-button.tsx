"use client";

import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

export default function ShareProfileButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <DropdownMenuItem
      onClick={() => {
        const profileUrl = `${window.location.origin}/users/${userId}`;
        if (navigator.share) {
          navigator
            .share({
              title: `${userName}'s Profile`,
              text: `Check out ${userName}'s profile on Virtual Try-On!`,
              url: profileUrl,
            })
            .catch(() => {});
        } else {
          navigator.clipboard
            .writeText(profileUrl)
            .then(() => toast.success("Profile URL copied to clipboard!"))
            .catch(() => {});
        }
      }}
    >
      Share Profile
      <DropdownMenuShortcut>
        <Share2Icon className="h-4 w-4" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
