<<<<<<< HEAD
"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
=======
"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
<<<<<<< HEAD
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
=======
        className
      )}
      {...props}
    />
  )
}

export { Separator }
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
