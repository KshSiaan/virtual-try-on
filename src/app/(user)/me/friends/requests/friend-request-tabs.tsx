"use client";

import TabsWithBadge from "@/components/shadcn-studio/tabs/tabs-04";
import { useQuery } from "@tanstack/react-query";
import Incoming from "./incoming";
import Requests from "./requests";

export type FriendRequest = {
  id: string;
  status: string;
};

export default function FriendRequestTabs() {
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

  const tabs = [
    {
      name: "Received Requests",
      value: "explore",
      count: pendingReceivedCount,
      content: <Incoming />,
    },
    {
      name: "Sent Requests",
      value: "sent",
      count: 0,
      content: <Requests />,
    },
  ];

  return <TabsWithBadge tabs={tabs} />;
}
