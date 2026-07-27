<<<<<<< HEAD
"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
=======
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
<<<<<<< HEAD
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
=======
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
<<<<<<< HEAD
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
=======
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
<<<<<<< HEAD
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
=======
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
<<<<<<< HEAD
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
=======
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
<<<<<<< HEAD
        "fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
=======
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
<<<<<<< HEAD
  showCloseButton?: boolean;
=======
  showCloseButton?: boolean
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
<<<<<<< HEAD
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none sm:max-w-md dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
=======
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
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
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
<<<<<<< HEAD
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
=======
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
<<<<<<< HEAD
  showCloseButton?: boolean;
=======
  showCloseButton?: boolean
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
<<<<<<< HEAD
        className,
=======
        className
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
<<<<<<< HEAD
      className={cn(
        "font-heading text-base leading-none font-medium",
        className,
      )}
      {...props}
    />
  );
=======
      className={cn("font-heading leading-none font-medium", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
<<<<<<< HEAD
        className,
      )}
      {...props}
    />
  );
=======
        className
      )}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
<<<<<<< HEAD
};
=======
}
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
