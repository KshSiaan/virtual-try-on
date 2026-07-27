import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import FriendRequestTabs from "./friend-request-tabs";

export default function Page() {
  return (
    <main className="py-24 container mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div className="space-y-2">
          <Button variant="outline" asChild>
            <Link href="/me/friends">
              <ArrowLeftIcon />
              Go back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Friend Requests</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your incoming friend requests here.
          </p>
        </div>
      </div>
      <FriendRequestTabs />
    </main>
  );
}
