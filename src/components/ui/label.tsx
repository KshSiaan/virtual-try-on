<<<<<<< HEAD
"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
=======
"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
<<<<<<< HEAD
        className,
      )}
      {...props}
    />
  );
}

export { Label };
=======
        className
      )}
      {...props}
    />
  )
}

export { Label }
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
