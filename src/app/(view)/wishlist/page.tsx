"use client";

import React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { HeartIcon, SearchIcon } from "lucide-react";
import {
  getWishlistItems,
  deleteWishlistItem,
  type WishlistItem,
} from "@/lib/api/wishlist/functions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";

const buildSizeTags = (item: WishlistItem) =>
  [item.size, item.chest, item.shoulder, item.sleeve].filter(
    Boolean,
  ) as string[];

function WishlistCardSkeleton() {
  return (
    <Card className="gap-0 py-3 pb-6">
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0">
        <Skeleton className="h-full w-full rounded-lg!" />
      </CardContent>
      <CardContent className="space-y-3 border-t p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </CardContent>
      <CardContent className="flex items-center justify-between gap-2 border-t p-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistCard({
  image,
  name,
  sizes,
  onClick,
}: {
  image: string;
  name: string;
  sizes: string[];
  onClick: () => void;
  id: string;
}) {
  return (
    <Card
      className="gap-0 py-3 pb-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0 overflow-hidden bg-muted/30">
        <Image
          alt={name}
          src={image}
          width={300}
          height={400}
          className="h-full w-full object-contain"
        />
      </CardContent>
      <CardContent className="space-y-3 border-t p-6">
        <h3 className="font-semibold line-clamp-2">{name}</h3>
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Badge key={size} variant="secondary" className="text-xs">
                {size}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="icon">
          <HeartIcon fill="currentColor" className="text-red-500" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WishlistPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState(9);
  const [selectedItem, setSelectedItem] = React.useState<WishlistItem | null>(
    null,
  );
  const deferredSearch = React.useDeferredValue(search);
  const qcl = useQueryClient();

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page on search/limit change
  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, limit]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["wishlist-items", page, limit, deferredSearch],
    queryFn: () => getWishlistItems({ page, limit, q: deferredSearch }),
    placeholderData: (previous) => previous,
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => deleteWishlistItem(id),
    onSuccess: () => {
      toast.success("Item removed from wishlist");
      qcl.invalidateQueries({ queryKey: ["wishlist-items"] });
      setSelectedItem(null);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to remove item");
    },
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / limit))
    : 1;
  const showFallbackCards = isLoading && items.length === 0;
  const detailTags = selectedItem
    ? [
        selectedItem.size,
        selectedItem.fit,
        selectedItem.type,
        selectedItem.chest,
        selectedItem.shoulder,
        selectedItem.sleeve,
      ].filter(Boolean)
    : [];

  return (
    <div className="grid h-full items-start gap-6 p-6 lg:grid-cols-5">
      <section className="order-2 lg:col-span-4 lg:order-1">
        <div className="mb-4 flex w-full items-center justify-between">
          <h1 className="pb-4 text-xl font-bold">My Wishlist</h1>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="lg:max-w-sm!">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wishlist items"
            />
          </InputGroup>

          <div className="flex items-center gap-3">
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 / page</SelectItem>
                <SelectItem value="9">9 / page</SelectItem>
                <SelectItem value="12">12 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {isFetching
                ? "Refreshing..."
                : pagination
                  ? `${pagination.total} items`
                  : ""}
            </div>
          </div>
        </div>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 text-sm text-destructive">
              {(error as Error).message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid h-full w-full gap-6 lg:grid-cols-3">
          {showFallbackCards
            ? Array.from({ length: 6 }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
                <React.Fragment key={index}>
                  <WishlistCardSkeleton />
                </React.Fragment>
              ))
            : items.map((item) => (
                <WishlistCard
                  key={item.id}
                  image={item.image}
                  name={item.name}
                  sizes={buildSizeTags(item)}
                  onClick={() => setSelectedItem(item)}
                  id={item.id}
                />
              ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
          >
            Previous
          </Button>

          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <Button
            variant="outline"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination?.hasMore || isFetching}
          >
            Next
          </Button>
        </div>
      </section>

      <div className="order-1 h-full self-start lg:col-span-1 lg:order-2">
        <div className="sticky top-30">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-6">
              <Button>My Wishlist</Button>
              <Button variant="outline" asChild>
                <Link href="/closet">My Closet</Link>
              </Button>
              <Button variant="outline" className="col-span-2">
                Recommendations
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
            <DialogTitle>{selectedItem?.name || "Wishlist item"}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description || "No description available."}
            </DialogDescription>
          </DialogHeader>

          {selectedItem ? (
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
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {selectedItem.type || "Uncategorized"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.fit || "regular"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`
                      ${selectedItem.priority === "high" ? "border-red-500/50 bg-red-500/10 text-red-700" : ""}
                      ${selectedItem.priority === "medium" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700" : ""}
                      ${selectedItem.priority === "low" ? "border-green-500/50 bg-green-500/10 text-green-700" : ""}
                    `}
                  >
                    {selectedItem.priority || "Medium"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>

                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Size:</span>{" "}
                    {selectedItem.size || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Chest:</span>{" "}
                    {selectedItem.chest || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Shoulder:</span>{" "}
                    {selectedItem.shoulder || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Sleeve:</span>{" "}
                    {selectedItem.sleeve || "—"}
                  </p>
                  {selectedItem.url && (
                    <p>
                      <span className="text-muted-foreground">Link:</span>{" "}
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View product
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Updated:</span>{" "}
                    {new Date(selectedItem.updatedAt).toLocaleString()}
                  </p>
                </div>

                {detailTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <div className="flex justify-end gap-2 pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Remove from wishlist
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove from wishlist?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove this item from your wishlist.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (!selectedItem) return;
                            deleteItem(selectedItem.id);
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
