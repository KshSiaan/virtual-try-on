"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

type SentRequest = {
  id: string;
  senderID: string;
  receiverID: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function Requests() {
  const qcl = useQueryClient();

  const { data, isLoading } = useQuery<{ data: SentRequest[] }>({
    queryKey: ["friend-requests", "sent"],
    queryFn: async () => {
      const res = await fetch("/api/friends/request?type=sent");
      if (!res.ok) throw new Error("Failed to fetch sent requests");
      return res.json();
    },
  });

  const { mutate: cancel, isPending: isCanceling } = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/friends/request?requestId=${requestId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Failed to cancel");
      return payload;
    },
    onSuccess: () => {
      toast.success("Friend request canceled");
      qcl.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
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
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const requests = data?.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <SendIcon className="size-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          You haven&apos;t sent any friend requests
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
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
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{req.user.name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={STATUS_STYLES[req.status] ?? ""}
              >
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </Badge>
              {req.status === "pending" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancel(req.id)}
                  disabled={isCanceling}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
