"use client";

import { useParams } from "next/navigation";

export default function ChatContent({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const hasFriend = !!params?.friendId;

    // Mobile: only show when a friend is selected; desktop: always visible
    return (
        <div className={`flex-1 flex flex-col overflow-hidden ${hasFriend ? "" : "hidden md:flex"}`}>
            {children}
        </div>
    );
}
