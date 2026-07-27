"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartIcon, ShirtIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type FeedItem = {
  id: string;
  name: string;
  type: string | null;
  size: string | null;
  image: string;
  wish: boolean;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
};

type FeedResponse = {
  data: FeedItem[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
};

function authorInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SkeletonCard() {
  return (
    <Card className="gap-0 pb-4">
      <CardHeader className="flex justify-start items-center border-b">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <Skeleton className="h-4 w-24 ml-4" />
      </CardHeader>
      <CardContent className="p-0 h-[40dvh]">
        <Skeleton className="w-full h-full rounded-none" />
      </CardContent>
      <CardContent className="border-t p-6 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-10 rounded-full" />
      </CardContent>
      <CardFooter className="border-t">
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="lg:col-span-3 flex flex-col items-center justify-center py-24 gap-4 text-center">
      <ShirtIcon className="size-14 text-muted-foreground/40" />
      <p className="font-medium text-muted-foreground">Nothing to show yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Add friends and ask them to make their closet items public — they'll
        appear here.
      </p>
    </div>
  );
}

export default function FriendFeed() {
  const qcl = useQueryClient();

  const { data, isLoading } = useQuery<FeedResponse>({
    queryKey: ["friends-closet"],
    queryFn: async () => {
      const res = await fetch("/api/friends/closet");
      if (!res.ok) throw new Error("Failed to load feed");
      return res.json();
    },
  });

  const { mutate: toggleWish, isPending } = useMutation({
    mutationFn: async ({ id, wish }: { id: string; wish: boolean }) => {
      if (wish) {
        const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        return res.json();
      }
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closetItemId: id }),
      });
      if (!res.ok) throw new Error("Failed to add to wishlist");
      return res.json();
    },
    onMutate: async ({ id, wish }) => {
      await qcl.cancelQueries({ queryKey: ["friends-closet"] });
      const prev = qcl.getQueryData<FeedResponse>(["friends-closet"]);
      qcl.setQueryData<FeedResponse>(["friends-closet"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item.id === id ? { ...item, wish: !wish } : item,
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qcl.setQueryData(["friends-closet"], ctx.prev);
      toast.error("Failed to update wishlist");
    },
    onSettled: () => {
      qcl.invalidateQueries({ queryKey: ["friends-closet"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6 w-full">
        {(["sk-a", "sk-b", "sk-c"] as const).map((k) => (
          <SkeletonCard key={k} />
        ))}
      </div>
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 w-full">
      {items.map((item) => (
        <Card key={item.id} className="gap-0 pb-4">
          <CardHeader className="flex justify-start items-center border-b">
            <Avatar className="size-10">
              <AvatarImage
                src={
                  item.author.image ??
                  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(item.author.name)}`
                }
              />
              <AvatarFallback>{authorInitials(item.author.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="ml-4 text-sm">{item.author.name}</CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex justify-center items-center h-[40dvh]">
            <Image
              className="object-contain w-full h-full"
              height={400}
              width={400}
              alt={item.name}
              src={item.image}
            />
          </CardContent>

          <CardContent className="border-t p-6 space-y-2">
            <h3 className="text-base font-semibold">{item.name}</h3>
            {item.type && (
              <p className="text-muted-foreground capitalize">{item.type}</p>
            )}
            {item.size && (
              <div>
                <Badge variant="outline">{item.size}</Badge>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t flex justify-start items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              disabled={isPending}
              onClick={() => toggleWish({ id: item.id, wish: item.wish })}
              className={item.wish ? "text-rose-500 hover:text-rose-600" : ""}
              title={item.wish ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon className={item.wish ? "fill-current" : ""} />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
