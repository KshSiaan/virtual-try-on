"use client";
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Share2Icon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function Share({
  me,
}: {
  me: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    banned: boolean | null | undefined;
    role?: string | null | undefined;
    banReason?: string | null | undefined;
    banExpires?: Date | null | undefined;
  };
}) {
  return (
    <DropdownMenuItem
      onClick={() => {
        const profileUrl = `${window.location.origin}/user/${me.id}`;
        if (navigator.share) {
          navigator
            .share({
              title: `${me.name}'s Profile`,
              text: `Check out ${me.name}'s profile on our Virtual Try-On app!`,
              url: profileUrl,
            })
            .catch((error) => {
              console.error("Error sharing:", error);
            });
        } else {
          navigator.clipboard
            .writeText(profileUrl)
            .then(() => {
              toast.success("Profile URL copied to clipboard!");
            })
            .catch((error) => {
              console.error("Error copying to clipboard:", error);
            });
        }
      }}
    >
      Share Profile
      <DropdownMenuShortcut>
        <Share2Icon className="mr-2 h-4 w-4" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
