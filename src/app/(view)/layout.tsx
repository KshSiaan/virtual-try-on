<<<<<<< HEAD
import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";
import { Suspense } from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<>loading..</>}>{children}</Suspense>
      {/* <DetailedFooter /> */}
    </>
=======
import Navbar from "@/components/core/navbar";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-col justify-start items-start gap-0 ">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
  );
}
