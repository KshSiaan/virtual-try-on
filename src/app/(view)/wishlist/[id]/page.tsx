"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import {
  getWishlistItem,
  deleteWishlistItem,
} from "@/lib/api/wishlist/functions";
import type { WishlistItem } from "@/lib/api/wishlist/functions";

export default function WishlistItemViewPage() {
  const params = useParams();
  const router = useRouter();
  const qcl = useQueryClient();

  const id = (params as { id?: string })?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist-item", id],
    queryFn: () => (id ? getWishlistItem(id) : Promise.reject("No ID")),
    enabled: !!id,
  });

  const item = data?.data as WishlistItem | undefined;

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No item ID");
      return await deleteWishlistItem(id);
    },
    onSuccess: () => {
      toast.success("Item deleted");
      qcl.invalidateQueries({ queryKey: ["wishlist-items"] });
      router.back();
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to delete item");
    },
  });

  const handleDelete = () => {
    const ok = confirm("Delete this item? This cannot be undone.");
    if (ok) deleteItem();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Item not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const detailTags = [
    item.size,
    item.fit,
    item.type,
    item.chest,
    item.shoulder,
    item.sleeve,
  ].filter(Boolean);

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Image Section */}
        <div className="flex items-center justify-center rounded-xl border bg-muted/30 overflow-hidden">
          <Image
            alt={item.name}
            src={item.image}
            width={1000}
            height={800}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            {item.description && (
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{item.type || "Uncategorized"}</Badge>
            <Badge variant="outline">{item.fit || "Regular"}</Badge>
            <Badge
              variant="outline"
              className={`
                ${item.priority === "high" ? "border-red-500/50 bg-red-500/10 text-red-700" : ""}
                ${item.priority === "medium" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700" : ""}
                ${item.priority === "low" ? "border-green-500/50 bg-green-500/10 text-green-700" : ""}
              `}
            >
              {item.priority || "Medium"}
            </Badge>
            <Badge variant="outline">
              {item.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          {/* Specifications */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{item.size || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fit</p>
                  <p className="font-medium">{item.fit || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chest</p>
                  <p className="font-medium">{item.chest || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shoulder</p>
                  <p className="font-medium">{item.shoulder || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sleeve</p>
                  <p className="font-medium">{item.sleeve || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Link */}
          {item.url && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Product Link
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {item.url}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p>{new Date(item.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detail Tags */}
          {detailTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {detailTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
