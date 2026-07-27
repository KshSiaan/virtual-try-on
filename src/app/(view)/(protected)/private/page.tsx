import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import FriendFeed from "./friend-feed";
import SendFriendRequest from "./send-friend-request";

export default async function Page() {
  const header = await headers();
  const user = await auth.api.getSession({ headers: header });
  if (!user?.session?.token) {
    return redirect("/auth/signin");
  }

  return (
    <div className="grid lg:grid-cols-5 p-6 gap-6 items-start h-full">
      <section className="lg:col-span-4 order-2 lg:order-1">
        <h1 className="font-bold text-xl pb-4 mb-4">Social Feed</h1>
        <FriendFeed />
      </section>

      <div className="lg:col-span-1 self-start h-full order-1 lg:order-2">
        <div className="sticky top-30">
          <h1 className="font-bold text-base pb-4">Filter</h1>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Public</Link>
              </Button>
              <Button>Private (Friends)</Button>
            </CardContent>
          </Card>
          <SendFriendRequest />
        </div>
      </div>
    </div>
  );
}
