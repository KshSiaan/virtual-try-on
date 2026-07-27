<<<<<<< HEAD
"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
=======
"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
<<<<<<< HEAD
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border",
        className,
      )}
      {...props}
    />
  );
=======
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
<<<<<<< HEAD
      className={cn("not-last:border-b data-open:bg-muted/50", className)}
      {...props}
    />
  );
=======
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
<<<<<<< HEAD
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-4 text-left text-sm font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
=======
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-md border border-transparent py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
        )}
        {...props}
      >
        {children}
<<<<<<< HEAD
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
=======
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
<<<<<<< HEAD
      className="overflow-hidden px-4 text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
=======
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
      {...props}
    >
      <div
        className={cn(
          "h-(--radix-accordion-content-height) pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
<<<<<<< HEAD
          className,
=======
          className
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
<<<<<<< HEAD
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
=======
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
