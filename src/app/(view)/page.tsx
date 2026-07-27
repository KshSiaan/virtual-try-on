<<<<<<< HEAD
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Categories from "./home/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/kibo-ui/spinner";
import DailyDiscover from "./home/daily-discover";
import HeroWrapper from "./home/hero-wrapper";
import MinimalCategories from "./home/minimal-categories";

export default async function Home() {
  return (
    <>
      <Suspense>
        <HeroWrapper />
      </Suspense>
      <main>
        <section className="container mx-auto grid grid-cols-6 gap-12 my-24">
          <Suspense
            fallback={Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i} className="block">
                <div className="aspect-square rounded-none border-dashed overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>

                <div className="mt-4 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>
            ))}
          >
            <Categories />
          </Suspense>
        </section>
        <section className="bg-muted my-24 py-12">
          <div className="container mx-auto pb-12">
            <h2 className="text-base font-semibold">Your daily discover</h2>
          </div>
          <div className="grid grid-cols-4 container mx-auto">
            <Suspense
              fallback={
                <div className="col-span-4 flex justify-center items-center">
                  <Spinner variant="infinite" />
                </div>
              }
            >
              <DailyDiscover />
            </Suspense>
          </div>
        </section>
        <section className="container mx-auto py-12">
          <h2 className="text-base font-semibold">Top Categories</h2>
          <div className="grid grid-cols-4 gap-6 mt-6">
            <MinimalCategories />
          </div>
        </section>
        <section className="container mx-auto py-12">
          <h2 className="text-base font-semibold">Featured Products</h2>
          <div className="grid grid-cols-4 container mx-auto mt-12">
            <Suspense
              fallback={
                <div className="col-span-4 flex justify-center items-center">
                  <Spinner variant="infinite" />
                </div>
              }
            >
              <DailyDiscover />
            </Suspense>
          </div>
        </section>
        <section className="bg-muted py-20">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="flex flex-col overflow-hidden shadow-sm border-0">
              <div className="flex-1 flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">
                    Heavy Lifting Support
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Get assistance with your toughest projects and achieve more
                    with reliable support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-muted-foreground text-sm leading-relaxed">
                  Our comprehensive solutions help you tackle complex
                  challenges. With expert guidance and professional tools,
                  you'll streamline operations and drive results.
                </CardContent>
              </div>
              <div className="relative w-full h-48 bg-muted/50">
                <Image
                  src="/illust/heavylifting.svg"
                  fill
                  className="object-contain p-4"
                  alt="Heavy lifting support"
                />
              </div>
            </Card>

            <Card className="flex flex-col overflow-hidden shadow-sm border-0">
              <div className="flex-1 flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Delivery Network</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Fast and reliable delivery to get your orders where they
                    need to be.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-muted-foreground text-sm leading-relaxed">
                  Experience seamless logistics with our modern delivery
                  infrastructure. Reach customers faster and build trust through
                  consistent, on-time service.
                </CardContent>
              </div>
              <div className="relative w-full h-48 bg-muted/50">
                <Image
                  src="/illust/drone_dilevery.svg"
                  fill
                  className="object-contain p-4"
                  alt="Drone delivery service"
                />
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
=======
"use client";

import React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ExternalLinkIcon,
  HeartIcon,
  SearchIcon,
  ShoppingBagIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { AffiliateProduct } from "@/lib/api/affiliates/functions";
import {
  addAffiliateWishlistItem,
  getAffiliateWishlistedIds,
  removeAffiliateWishlistItem,
} from "@/lib/api/affiliates/wishlist-functions";

function WishlistButton({
  itemId,
  isWishlisted,
  onToggle,
  pending,
}: {
  itemId: string;
  isWishlisted: boolean;
  onToggle: (id: string, current: boolean) => void;
  pending: boolean;
}) {
  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute top-2 right-2 size-8 rounded-full shadow-sm"
      disabled={pending}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(itemId, isWishlisted);
      }}
    >
      {isWishlisted ? (
        <HeartIcon className="size-4 text-red-500" fill="currentColor" />
      ) : (
        <HeartIcon className="size-4" />
      )}
    </Button>
  );
}

export default function Page() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [selectedItem, setSelectedItem] =
    React.useState<AffiliateProduct | null>(null);
  const deferredSearch = React.useDeferredValue(search);
  const qcl = useQueryClient();

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page on search
  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const { data, isLoading, isFetching } = useQuery<{
    data: AffiliateProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }>({
    queryKey: ["affiliate-feed", page, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (deferredSearch) params.set("q", deferredSearch);
      const res = await fetch(`/api/affiliates/public?${params}`);
      if (!res.ok) throw new Error("Failed to load feed");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const { data: wishlistedIds = [] } = useQuery<string[]>({
    queryKey: ["affiliate-wishlist-ids"],
    queryFn: getAffiliateWishlistedIds,
    staleTime: 60_000,
  });

  const wishlistedSet = React.useMemo(
    () => new Set(wishlistedIds),
    [wishlistedIds],
  );

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      isWishlisted,
    }: {
      id: string;
      isWishlisted: boolean;
    }) => {
      if (isWishlisted) return removeAffiliateWishlistItem(id);
      return addAffiliateWishlistItem(id);
    },
    onSuccess: (_, { isWishlisted }) => {
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      );
      qcl.invalidateQueries({ queryKey: ["affiliate-wishlist-ids"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to update wishlist");
    },
  });

  const handleToggle = (id: string, isWishlisted: boolean) => {
    toggleMutation.mutate({ id, isWishlisted });
  };

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1;

  return (
    <div className="grid lg:grid-cols-5 p-6 gap-6 items-start h-full">
      <section className="lg:col-span-4 order-2 lg:order-1">
        <div className="mb-4 flex w-full items-center justify-between">
          <h1 className="font-bold text-xl pb-4">Feed</h1>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="lg:max-w-sm!">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </InputGroup>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {isFetching
              ? "Refreshing..."
              : pagination
                ? `${pagination.total} products`
                : ""}
          </div>
        </div>

        <div className="grid h-full w-full gap-6 lg:grid-cols-3">
          {isLoading && items.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <Card
                  key={`sk-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    i
                  }`}
                  className="gap-0 py-3 pb-6"
                >
                  <CardContent className="h-[40dvh] p-0">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </CardContent>
                  <CardContent className="space-y-2 border-t p-6">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))
            : items.map((item) => (
                <Card
                  key={item.id}
                  className="gap-0 py-3 pb-6 cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="relative flex h-[40dvh] items-center justify-center rounded-lg! p-0">
                    <Image
                      className="h-full w-full rounded-lg! object-contain"
                      height={400}
                      width={400}
                      alt={item.name}
                      src={item.image}
                    />
                    <WishlistButton
                      itemId={item.id}
                      isWishlisted={wishlistedSet.has(item.id)}
                      onToggle={handleToggle}
                      pending={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.id === item.id
                      }
                    />
                  </CardContent>
                  <CardContent className="space-y-1 border-t p-6">
                    <h3 className="text-base font-semibold line-clamp-1">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-sm text-muted-foreground">
                        {item.brand}
                      </p>
                    )}
                    {item.price != null && (
                      <p className="text-sm font-medium">
                        {item.currency ?? "USD"} {item.price}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <ShoppingBagIcon className="size-12 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">
              No products available
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later for new affiliate products.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination?.hasMore || isFetching}
          >
            Next
          </Button>
        </div>
      </section>

      <div className="lg:col-span-1 self-start h-full order-1 lg:order-2">
        <div className="sticky top-30">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-6">
              <Button>Public</Button>
              <Button variant="outline" asChild>
                <Link href="/private">Private (Friends)</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            {selectedItem?.brand && (
              <DialogDescription>{selectedItem.brand}</DialogDescription>
            )}
          </DialogHeader>

          {selectedItem && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                <Image
                  alt={selectedItem.name}
                  src={selectedItem.image}
                  width={1000}
                  height={800}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-4">
                {selectedItem.brand && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Brand
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedItem.brand}
                    </p>
                  </div>
                )}

                {selectedItem.price != null && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedItem.currency ?? "USD"} {selectedItem.price}
                    </p>
                  </div>
                )}

                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description}
                  </p>
                )}

                {(selectedItem.type ||
                  selectedItem.fit ||
                  selectedItem.size ||
                  selectedItem.storeName) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.type && (
                      <Badge variant="outline" className="capitalize">
                        {selectedItem.type}
                      </Badge>
                    )}
                    {selectedItem.fit && (
                      <Badge variant="outline" className="capitalize">
                        {selectedItem.fit}
                      </Badge>
                    )}
                    {selectedItem.size && (
                      <Badge variant="outline">{selectedItem.size}</Badge>
                    )}
                    {selectedItem.storeName && (
                      <Badge variant="secondary">
                        {selectedItem.storeName}
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  variant={
                    wishlistedSet.has(selectedItem.id) ? "secondary" : "outline"
                  }
                  className="w-full"
                  disabled={
                    toggleMutation.isPending &&
                    toggleMutation.variables?.id === selectedItem.id
                  }
                  onClick={() =>
                    handleToggle(
                      selectedItem.id,
                      wishlistedSet.has(selectedItem.id),
                    )
                  }
                >
                  <HeartIcon
                    className="size-4"
                    fill={
                      wishlistedSet.has(selectedItem.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {wishlistedSet.has(selectedItem.id)
                    ? "Saved to Wishlist"
                    : "Save to Wishlist"}
                </Button>

                <Button className="w-full" size="lg" asChild>
                  <a
                    href={selectedItem.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="size-4" />
                    Buy Now
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
  );
}
