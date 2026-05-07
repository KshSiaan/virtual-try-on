"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EditIcon, HeartIcon, Share2Icon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createWishlistItem,
  removeWishlistItem,
} from "@/lib/api/wishlist/functions";

export type ClosetCardProps = {
  image: string;
  name: string;
  id: string;
  category: string;
  sizes?: string[];
  wish?: boolean;
  fallbackImage?: string;
  onClick?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
};

export default function ClosetCard({
  image,
  name,
  id,
  category,
  sizes = [],
  wish = false,
  fallbackImage = "https://placehold.co/1000x800/png",
  onClick,
  onFavorite,
  onShare,
}: ClosetCardProps) {
  const resolvedImage = image || fallbackImage;
  const qcl = useQueryClient();
  const [isInWishlist, setIsInWishlist] = React.useState(wish);

  const wishlistMutation = useMutation({
    mutationKey: ["toggle-wishlist-from-closet", id],
    mutationFn: async (shouldAdd: boolean) => {
      if (shouldAdd) {
        return await createWishlistItem({ closetItemId: id });
      }
      return await removeWishlistItem(id);
    },
    onMutate: (shouldAdd: boolean) => {
      setIsInWishlist(shouldAdd);
    },
    onSuccess: (_res, shouldAdd) => {
      toast.success(shouldAdd ? "Added to wishlist" : "Removed from wishlist");
      qcl.invalidateQueries({ queryKey: ["closet-items"] });
      qcl.invalidateQueries({ queryKey: ["wishlist-items-all"] });
    },
    onError: (err: unknown) => {
      setIsInWishlist(!isInWishlist);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to update wishlist");
    },
  });

  return (
    <Card
      className="gap-0 py-3 pb-6 transition-transform duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0">
        <Image
          className="h-full w-full rounded-lg! object-contain"
          height={400}
          width={400}
          alt={name}
          src={resolvedImage}
        />
      </CardContent>
      <CardContent className="space-y-2 border-t p-6">
        <h3 className="text-base font-semibold">{name}</h3>
        <p className="text-muted-foreground">{category}</p>
        {sizes.length > 0 ? (
          <div className="space-x-2 space-y-2">
            {sizes.map((size) => (
              <Badge key={size} variant="outline">
                {size}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t">
        <Button
          size="icon"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            wishlistMutation.mutate(!isInWishlist);
            onFavorite?.();
          }}
          disabled={wishlistMutation.status === "pending"}
          type="button"
        >
          {isInWishlist ? (
            <HeartIcon fill="currentColor" className="text-red-600" />
          ) : (
            <HeartIcon />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" type="button" asChild>
            <Link href={`/closet/edit/${id}`}>
              <EditIcon />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            type="button"
          >
            <Trash2Icon />
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
        </div>
      </CardFooter>
    </Card>
  );
}
