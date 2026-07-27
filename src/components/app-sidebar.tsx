"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
<<<<<<< HEAD
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
=======
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
<<<<<<< HEAD
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  LifeBuoyIcon,
  SendIcon,
  PieChartIcon,
  TerminalIcon,
  FileCogIcon,
  ComputerIcon,
  ShoppingCartIcon,
  Ellipsis,
} from "lucide-react";
import Link from "next/link";

const data = {
  user: {
    name: "ADMIN",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Platform Overview",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Users",
          url: "/users",
        },
      ],
    },
    {
      title: "Product & Managers",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Managers",
          url: "/managers",
        },
        {
          title: "Product Listing",
          url: "/products",
        },
        {
          title: "Product Categories",
          url: "/categories",
        },
        {
          title: "Coupons & Discounts",
          url: "/coupons",
        },
      ],
    },
    {
      title: "Orders & Insights",
      url: "#",
      icon: <ShoppingCartIcon />,
      items: [
        {
          title: "Orders",
          url: "/orders",
        },
        {
          title: "Insights",
          url: "/insights",
        },
        {
          title: "Transactions",
          url: "/transactions",
        },
      ],
    },
    {
      title: "Others",
      url: "#",
      icon: <Ellipsis />,
      items: [
        {
          title: "Promotions",
          url: "/promotions",
        },
        {
          title: "Banners",
          url: "/banners",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
    },
    {
      title: "Pages",
      url: "/pages",
      icon: <FileCogIcon />,
    },
    {
      title: "Developer",
      url: "/dev",
      icon: <ComputerIcon />,
    },
  ],
  projects: [
    {
      name: "Sales & Marketing",
      url: "/sales-marketing",
      icon: <PieChartIcon />,
    },
    {
      name: "Manager Feedbacks",
      url: "/manager-feedbacks",
      icon: <LifeBuoyIcon />,
=======
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  UsersIcon,
  NetworkIcon,
  NotebookPenIcon,
} from "lucide-react";
import Image from "next/image";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navs: [
    {
      name: "Users",
      url: "/admin/dashboard/users",
      icon: <UsersIcon />,
    },
    {
      name: "Affiliates",
      url: "/admin/dashboard/affiliates",
      icon: <NotebookPenIcon />,
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
    },
  ],
};

<<<<<<< HEAD
const AppName = process.env.NEXT_PUBLIC_APP_NAME || "Kintehobe";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{AppName}</span>
                  <span className="truncate text-xs">Inc.</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
=======
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Image
          src={"/logo.svg"}
          height={64}
          width={64}
          alt="icon"
          className="mx-auto mt-2"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navs} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
<<<<<<< HEAD
=======
      <SidebarRail />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
    </Sidebar>
  );
}
