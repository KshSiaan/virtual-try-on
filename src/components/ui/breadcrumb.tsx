<<<<<<< HEAD
import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
=======
import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5",
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

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
<<<<<<< HEAD
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";
=======
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
<<<<<<< HEAD
      {children ?? <ChevronRightIcon />}
    </li>
  );
=======
      {children ?? (
        <ChevronRightIcon />
      )}
    </li>
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
<<<<<<< HEAD
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  );
=======
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
<<<<<<< HEAD
};
=======
}
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
