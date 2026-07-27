"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRoundXIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

type Friend = {
  friendshipId: string;
  since: string;
  user: { id: string; name: string; image: string | null };
};

export default function FriendsList() {
  const qcl = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Friend[] }>({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Failed to fetch friends");
      return res.json();
    },
  });

  const { mutate: unfriend, isPending } = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await fetch(`/api/friends?friendId=${friendId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(payload?.message || "Failed to remove friend");
      return payload;
    },
    onSuccess: () => {
      toast.success("Friend removed");
      qcl.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove friend",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {(["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"] as const).map(
          (key) => (
            <Card key={key}>
              <CardContent className="flex items-center gap-4 py-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </CardContent>
            </Card>
          ),
        )}
      </div>
    );
  }

  const friends = data?.data ?? [];

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3 mt-8">
        <UsersIcon className="size-14 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No friends yet</p>
        <p className="text-sm text-muted-foreground">
          Send a friend request to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {friends.map((f) => (
        <Card key={f.friendshipId}>
          <CardContent className="flex items-center gap-4 py-4">
            <Avatar>
              <AvatarImage
                src={
                  f.user.image ??
                  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(f.user.name)}`
                }
              />
              <AvatarFallback>
                {f.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{f.user.name}</p>
              <p className="text-xs text-muted-foreground">
                Since{" "}
                {new Date(f.since).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={isPending}
                  title="Remove friend"
                >
                  <UserRoundXIcon className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove {f.user.name} from your
                    friends list?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => unfriend(f.user.id)}
                    disabled={isPending}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
