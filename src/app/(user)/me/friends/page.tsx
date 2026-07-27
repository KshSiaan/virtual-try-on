"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import FriendsList from "./friends-list";
import type { FriendRequest } from "./requests/friend-request-tabs";

export default function Page() {
  const { data: receivedData } = useQuery<{ data: FriendRequest[] }>({
    queryKey: ["friend-requests", "received"],
    queryFn: async () => {
      const res = await fetch("/api/friends/request?type=received");
      if (!res.ok) throw new Error("Failed to fetch received requests");
      return res.json();
    },
  });

  const pendingReceivedCount = (receivedData?.data ?? []).filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <main className="py-24 container mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-muted-foreground mt-2">
            Manage your friends and friend requests here.
          </p>
        </div>
        <Button variant="outline" className="relative" asChild>
          <Link href="/me/friends/requests">
            Friend Requests
            {pendingReceivedCount > 0 && (
              <Badge className="absolute -top-2 -right-2 rounded-full text-xs! aspect-square!">
                {pendingReceivedCount}
              </Badge>
            )}
          </Link>
        </Button>
      </div>
      <FriendsList />
    </main>
  );
}
