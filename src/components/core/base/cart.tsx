"use client";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import {
  InboxIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } =
    useCartStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="relative">
          <ShoppingCartIcon />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <PopoverHeader className="border-b pb-3">
          <PopoverTitle className="text-sm font-semibold">
            Your Cart ({itemCount})
          </PopoverTitle>
          <PopoverDescription className="text-xs text-muted-foreground">
            Review your items and proceed to checkout.
          </PopoverDescription>
        </PopoverHeader>

        {items.length === 0 ? (
          <div className="py-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>Your cart is empty</EmptyTitle>
                <EmptyDescription>Add items to get started</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild size="sm" variant="outline">
                  <Link href="/">Browse products</Link>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <>
            <div className="max-h-[50dvh] overflow-y-auto divide-y">
              {items.map((item) => {
                const image = item.selection.images?.[0] ?? null;
                return (
                  <div key={item.id} className="flex gap-3 py-3 px-1">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.productTitle}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCartIcon className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {item.productTitle}
                      </p>
                      {item.selection.title && (
                        <p className="text-xs text-muted-foreground">
                          {item.selection.title}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.selection.stockQuantity
                            }
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatMoney(item.lineTotal)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2Icon className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="pt-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <Button asChild className="w-full" size="sm">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
