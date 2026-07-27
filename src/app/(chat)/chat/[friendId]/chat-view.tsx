"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, SendHorizonalIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    created_at: string;
};

function initials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function ChatView({
    userId,
    friendId,
    friendName,
    friendImage,
}: {
    userId: string;
    friendId: string;
    friendName: string;
    friendImage: string | null;
}) {
    const qcl = useQueryClient();
    const queryKey = ["chat", userId, friendId];
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useQuery<{ data: Message[] }>({
        queryKey,
        queryFn: async () => {
            const res = await fetch(`/api/chat/messages?friendId=${friendId}`);
            if (!res.ok) throw new Error("Failed to load messages");
            return res.json();
        },
    });

    const messages = data?.data ?? [];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // Supabase realtime — listen for messages sent TO us from this friend
    useEffect(() => {
        const supabase = getSupabaseBrowserClient();

        const channel = supabase
            .channel(`chat-${[userId, friendId].sort().join("-")}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `receiver_id=eq.${userId}`,
                },
                (payload) => {
                    const msg = payload.new as Message;
                    if (msg.sender_id !== friendId) return;
                    qcl.setQueryData<{ data: Message[] }>(queryKey, (old) => {
                        if (!old) return old;
                        if (old.data.some((m) => m.id === msg.id)) return old;
                        return { ...old, data: [...old.data, msg] };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, friendId]);

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setText("");

        const tempId = `opt-${Date.now()}`;
        const optimistic: Message = {
            id: tempId,
            sender_id: userId,
            receiver_id: friendId,
            text: trimmed,
            created_at: new Date().toISOString(),
        };

        qcl.setQueryData<{ data: Message[] }>(queryKey, (old) => {
            if (!old) return old;
            return { ...old, data: [...old.data, optimistic] };
        });

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: friendId, text: trimmed }),
            });

            if (!res.ok) throw new Error("Failed to send");

            const { data: sent } = await res.json();

            qcl.setQueryData<{ data: Message[] }>(queryKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((m) => (m.id === tempId ? sent : m)),
                };
            });
        } catch {
            qcl.setQueryData<{ data: Message[] }>(queryKey, (old) => {
                if (!old) return old;
                return { ...old, data: old.data.filter((m) => m.id !== tempId) };
            });
            toast.error("Failed to send message");
            setText(trimmed);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 -ml-1"
                    asChild
                >
                    <Link href="/chat">
                        <ArrowLeftIcon className="size-4" />
                    </Link>
                </Button>
                <Avatar className="size-8">
                    <AvatarImage
                        src={
                            friendImage ??
                            `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(friendName)}`
                        }
                    />
                    <AvatarFallback className="text-xs">{initials(friendName)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{friendName}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-48 rounded-2xl" />
                        <Skeleton className="h-8 w-64 rounded-2xl ml-auto" />
                        <Skeleton className="h-8 w-40 rounded-2xl" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No messages yet — say hello!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const mine = msg.sender_id === userId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${mine ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                                        mine
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-muted rounded-bl-sm"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 px-4 py-3 border-t shrink-0 bg-background"
            >
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Message ${friendName}…`}
                    disabled={sending}
                    className="flex-1"
                    autoComplete="off"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!text.trim() || sending}
                    aria-label="Send message"
                >
                    <SendHorizonalIcon className="size-4" />
                </Button>
            </form>
        </div>
    );
}
