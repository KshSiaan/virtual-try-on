"use client";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { Edit2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default function UploadAvatar() {
  const navig = useRouter();
  const { mutate, isPending } = useMutation({
    mutationKey: ["update-avatar"],
    mutationFn: async ({ formData }: { formData: FormData }) => {
      const res = fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
      return res;
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to complete this request");
      const fileInput = document.getElementById(
        "avatar-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
    onSuccess: (res: any) => {
      toast.success(res.message ?? "Successfully updated the avatar!");
      navig.refresh();
      const fileInput = document.getElementById(
        "avatar-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
  });
  return (
    <label
      htmlFor="avatar-upload"
      className="absolute bottom-3 right-3 bg-background hover:bg-primary/10 transition-colors z-10 border rounded-full p-2"
    >
      {isPending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <Edit2Icon className="h-4 w-4" />
      )}
      <input
        id="avatar-upload"
        type="file"
        className="hidden"
        accept="image/*"
        multiple={false}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const formData = new FormData();
            formData.append("avatar", file);
            mutate({ formData });
          }
        }}
      />
    </label>
  );
}
