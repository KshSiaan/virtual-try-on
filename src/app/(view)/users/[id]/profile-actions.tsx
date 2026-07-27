"use client";

import { Button } from "@/components/ui/button";
import { UserPlusIcon, UserCheckIcon, UserXIcon, ClockIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FriendshipStatus = "none" | "friends" | "request_sent" | "request_received";

export default function ProfileActions({
  targetId,
  initialStatus,
}: {
  targetId: string;
  initialStatus: FriendshipStatus;
}) {
  const qc = useQueryClient();
  const router = useRouter();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["user-profile", targetId] });
    router.refresh();
  };

  const sendRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendID: targetId }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => { toast.success("Friend request sent!"); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const cancelRequest = useMutation({
    mutationFn: async () => {
      // fetch the sent request id first
      const res = await fetch("/api/friends/request?type=sent");
      const json = await res.json();
      const req = json.data?.find(
        (r: { receiverID: string; id: string; status: string }) =>
          r.receiverID === targetId && r.status === "pending",
      );
      if (!req) throw new Error("Request not found");
      const del = await fetch(`/api/friends/request?requestId=${req.id}`, { method: "DELETE" });
      if (!del.ok) throw new Error((await del.json()).message);
    },
    onSuccess: () => { toast.success("Friend request cancelled."); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/friends/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: targetId }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => { toast.success("Friend request accepted!"); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeFriend = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/friends?friendId=${targetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => { toast.success("Friend removed."); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  if (initialStatus === "friends") {
    return (
      <Button
        variant="outline"
        onClick={() => removeFriend.mutate()}
        disabled={removeFriend.isPending}
      >
        <UserXIcon />
        {removeFriend.isPending ? "Removing..." : "Remove Friend"}
      </Button>
    );
  }

  if (initialStatus === "request_sent") {
    return (
      <Button
        variant="outline"
        onClick={() => cancelRequest.mutate()}
        disabled={cancelRequest.isPending}
      >
        <ClockIcon />
        {cancelRequest.isPending ? "Cancelling..." : "Request Sent"}
      </Button>
    );
  }

  if (initialStatus === "request_received") {
    return (
      <>
        <Button
          onClick={() => acceptRequest.mutate()}
          disabled={acceptRequest.isPending}
        >
          <UserCheckIcon />
          {acceptRequest.isPending ? "Accepting..." : "Accept Request"}
        </Button>
        <Button
          variant="outline"
          onClick={() => cancelRequest.mutate()}
          disabled={cancelRequest.isPending}
        >
          Decline
        </Button>
      </>
    );
  }

  return (
    <Button
      onClick={() => sendRequest.mutate()}
      disabled={sendRequest.isPending}
    >
      <UserPlusIcon />
      {sendRequest.isPending ? "Sending..." : "Add Friend"}
    </Button>
  );
}
