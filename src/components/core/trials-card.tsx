"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Download, Share2Icon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type TrialsCardProps = {
  id: string;
  resultImageUrl: string;
  caption: string;
  model: string;
  size: string;
  status: string;
  createdAt: string;
  fallbackImage?: string;
  onShare?: () => void;
  onDownload?: () => void;
};

export default function TrialsCard({
  id,
  resultImageUrl,
  caption,
  model,
  size,
  status,
  createdAt,
  fallbackImage = "https://placehold.co/1000x800/png",
  onShare,
  onDownload,
}: TrialsCardProps) {
  const resolvedImage = resultImageUrl || fallbackImage;
  const qcl = useQueryClient();

  //   const deleteMutation = useMutation({
  //     mutationKey: ["delete-trial", id],
  //     mutationFn: async () => {
  //       const res = await fetch(`/api/user/trials/${id}`, {
  //         method: "DELETE",
  //       });
  //       if (!res.ok) throw new Error("Failed to delete trial");
  //       return res.json();
  //     },
  //     onSuccess: () => {
  //       toast.success("Trial deleted successfully");
  //       qcl.invalidateQueries({ queryKey: ["trials"] });
  //       onDelete?.();
  //     },
  //     onError: (err: unknown) => {
  //       const message = err instanceof Error ? err.message : String(err);
  //       toast.error(message || "Failed to delete trial");
  //     },
  //   });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(resolvedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trial-${id}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
      onDownload?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Download failed";
      toast.error(message);
    }
  };

  return (
    <Card className="gap-0 py-3 pb-6 transition-transform duration-200 hover:-translate-y-1">
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0">
        <Image
          className="h-full w-full rounded-lg! object-contain"
          height={400}
          width={400}
          alt={caption || "Trial result"}
          src={resolvedImage}
        />
      </CardContent>
      <CardContent className="space-y-2 border-t p-6">
        <h3 className="text-base font-semibold line-clamp-2">{caption}</h3>
        <p className="text-sm text-muted-foreground text-end">
          {formatDate(createdAt)}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDownload();
          }}
        >
          <Download />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onShare?.();
          }}
          type="button"
        >
          <Share2Icon />
        </Button>
      </CardFooter>
    </Card>
  );
}
