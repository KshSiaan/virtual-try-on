import { MessagesSquareIcon } from "lucide-react";

export default function ChatIndexPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground select-none">
            <MessagesSquareIcon className="size-14 opacity-20" />
            <p className="font-medium">Select a friend to start chatting</p>
        </div>
    );
}
