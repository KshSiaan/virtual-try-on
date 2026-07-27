"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users2Icon } from "lucide-react";
import { toast } from "sonner";

type FriendRequest = {
  id: string;
  senderID: string;
  receiverID: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
};

export default function Incoming() {
  const qcl = useQueryClient();

  const { data, isLoading } = useQuery<{ data: FriendRequest[] }>({
    queryKey: ["friend-requests", "received"],
    queryFn: async () => {
      const res = await fetch("/api/friends/request?type=received");
      if (!res.ok) throw new Error("Failed to fetch received requests");
      return res.json();
    },
  });

  const { mutate: accept, isPending: isAccepting } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch("/api/friends/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Failed to accept");
      return payload;
    },
    onSuccess: () => {
      toast.success("Friend request accepted");
      qcl.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to accept");
    },
  });

  const { mutate: decline, isPending: isDeclining } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/friends/request?requestId=${requestId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Failed to decline");
      return payload;
    },
    onSuccess: () => {
      toast.success("Friend request declined");
      qcl.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to decline");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {(["sk-a", "sk-b", "sk-c"] as const).map((key) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 py-4">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pending = (data?.data ?? []).filter((r) => r.status === "pending");

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Users2Icon className="size-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No pending friend requests</p>
      </div>
    );
  }

  const isBusy = isAccepting || isDeclining;

  return (
    <div className="space-y-3">
      {pending.map((req) => (
        <Card key={req.id}>
          <CardContent className="flex items-center gap-4 py-4">
            <Avatar>
              <AvatarImage
                src={
                  req.user.image ??
                  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(req.user.name)}`
                }
              />
              <AvatarFallback>
                {req.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{req.user.name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={() => accept(req.id)} disabled={isBusy}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => decline(req.id)}
                disabled={isBusy}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
