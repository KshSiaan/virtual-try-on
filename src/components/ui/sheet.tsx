<<<<<<< HEAD
"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
=======
"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
<<<<<<< HEAD
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
=======
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
<<<<<<< HEAD
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
=======
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
<<<<<<< HEAD
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
=======
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
<<<<<<< HEAD
        "fixed inset-0 z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
=======
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
<<<<<<< HEAD
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
=======
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
<<<<<<< HEAD
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-xl transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className,
=======
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
<<<<<<< HEAD
              className="absolute top-4 right-4 bg-secondary"
              size="icon-sm"
            >
              <XIcon />
=======
              className="absolute top-4 right-4"
              size="icon-sm"
            >
              <XIcon
              />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
<<<<<<< HEAD
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  );
=======
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
<<<<<<< HEAD
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  );
=======
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
<<<<<<< HEAD
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
=======
      className={cn("font-heading font-medium text-foreground", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
<<<<<<< HEAD
};
=======
}
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
