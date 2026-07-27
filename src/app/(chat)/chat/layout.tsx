import FriendsSidebar from "./friends-sidebar";
import ChatContent from "./chat-content";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex mt-14 h-[calc(100svh-3.5rem)] overflow-hidden border-t">
            <FriendsSidebar />
            <ChatContent>{children}</ChatContent>
        </div>
    );
}
