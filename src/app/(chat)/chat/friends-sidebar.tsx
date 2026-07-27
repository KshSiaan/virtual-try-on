"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Friend = {
    friendshipId: string;
    since: string;
    user: { id: string; name: string; image: string | null };
};

function initials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function FriendsSidebar() {
    const params = useParams();
    const activeFriendId = params?.friendId as string | undefined;

    const { data, isLoading } = useQuery<{ data: Friend[] }>({
        queryKey: ["friends"],
        queryFn: async () => {
            const res = await fetch("/api/friends");
            if (!res.ok) throw new Error("Failed to fetch friends");
            return res.json();
        },
    });

    const friends = data?.data ?? [];

    // Mobile: full-width when no chat open, hidden when chat is open
    // Desktop (md+): fixed 288px sidebar always visible
    const asideClass = activeFriendId
        ? "hidden md:flex md:w-72 border-r flex-col shrink-0 overflow-hidden bg-background"
        : "flex w-full md:w-72 border-r flex-col shrink-0 overflow-hidden bg-background";

    return (
        <aside className={asideClass}>
            <div className="p-4 border-b flex items-center gap-2">
                <MessageCircleIcon className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-3 space-y-1">
                        {(["a", "b", "c"] as const).map((k) => (
                            <div key={k} className="flex items-center gap-3 p-2">
                                <Skeleton className="size-10 rounded-full shrink-0" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        ))}
                    </div>
                ) : friends.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                        No friends yet.{" "}
                        <Link href="/me/friends" className="underline underline-offset-2">
                            Add some!
                        </Link>
                    </p>
                ) : (
                    <ul>
                        {friends.map((f) => (
                            <li key={f.friendshipId}>
                                <Link
                                    href={`/chat/${f.user.id}`}
                                    className={`flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors ${
                                        activeFriendId === f.user.id
                                            ? "bg-muted font-medium"
                                            : ""
                                    }`}
                                >
                                    <Avatar className="size-9 shrink-0">
                                        <AvatarImage
                                            src={
                                                f.user.image ??
                                                `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(f.user.name)}`
                                            }
                                        />
                                        <AvatarFallback className="text-xs">
                                            {initials(f.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-sm">{f.user.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}
