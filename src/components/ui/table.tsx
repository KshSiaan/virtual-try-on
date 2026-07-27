<<<<<<< HEAD
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
=======
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
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

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
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

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
<<<<<<< HEAD
        "h-12 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
=======
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
<<<<<<< HEAD
        "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
=======
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
<<<<<<< HEAD
};
=======
}
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
