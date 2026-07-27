import Navbar from "@/components/core/navbar";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  const user = await auth.api.getSession({
    headers: header,
  });
  if (!user?.session?.token) {
    return redirect("/auth/signin");
  }
  return (
    <div className="w-full flex-col justify-start items-start gap-0 ">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
