<<<<<<< HEAD
"use client"
=======
"use client";
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
<<<<<<< HEAD
} from "@/components/ui/dropdown-menu"
=======
} from "@/components/ui/dropdown-menu";
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
<<<<<<< HEAD
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react"
=======
} from "@/components/ui/sidebar";
import {
  MoreHorizontalIcon,
  FolderIcon,
  ArrowRightIcon,
  Trash2Icon,
} from "lucide-react";
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

export function NavProjects({
  projects,
}: {
  projects: {
<<<<<<< HEAD
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
=======
    name: string;
    url: string;
    icon: React.ReactNode;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* <SidebarGroupLabel>Projects</SidebarGroupLabel> */}
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="aria-expanded:bg-muted"
                >
<<<<<<< HEAD
                  <MoreHorizontalIcon
                  />
=======
                  <MoreHorizontalIcon />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
<<<<<<< HEAD
                className="w-48"
=======
                className="w-48 rounded-lg"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <FolderIcon className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
<<<<<<< HEAD
                  <ShareIcon className="text-muted-foreground" />
=======
                  <ArrowRightIcon className="text-muted-foreground" />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2Icon className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
<<<<<<< HEAD
        <SidebarMenuItem>
          <SidebarMenuButton>
            <MoreHorizontalIcon
            />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
=======
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}
