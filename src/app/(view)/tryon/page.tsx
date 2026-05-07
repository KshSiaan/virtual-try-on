"use client";

import React from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TryonCard from "@/components/core/tryon-card";
import Add from "./add";
import {
  deleteTryonItem,
  getTryonItems,
  type TryonItem,
} from "@/lib/api/tryon/functions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EditIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLACEHOLDER_IMAGE = "https://placehold.co/1000x800/png";
const PLACEHOLDER_KEYS = [
  "placeholder-1",
  "placeholder-2",
  "placeholder-3",
  "placeholder-4",
  "placeholder-5",
  "placeholder-6",
];

function TryonCardSkeleton() {
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

const buildTags = (item: TryonItem) =>
  [
    item.size,
    item.chest,
    item.shoulder,
    item.sleeve,
    item.waist,
    item.rise,
    item.inseam,
    item.head,
    item.shoe,
  ].filter(Boolean) as string[];

export default function Page() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState(9);
  const [selectedItem, setSelectedItem] = React.useState<TryonItem | null>(
    null,
  );
  const deferredSearch = React.useDeferredValue(search);
  const qcl = useQueryClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["tryon-items", page, limit, deferredSearch],
    queryFn: () => getTryonItems({ page, limit, q: deferredSearch }),
    placeholderData: (previous) => previous,
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => deleteTryonItem(id),
    onSuccess: () => {
      toast.success("Item deleted");
      qcl.invalidateQueries({ queryKey: ["tryon-items"] });
      setSelectedItem(null);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to delete item");
    },
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / limit))
    : 1;
  const showFallbackCards = isLoading && items.length === 0;
  const detailTags = selectedItem ? buildTags(selectedItem) : [];
  //
  return (
    <div className="grid h-full items-start gap-6 p-6 lg:grid-cols-4">
      <section className="lg:col-span-4">
        <div className="mb-4 flex w-full items-center justify-between">
          <h1 className="pb-4 text-xl font-bold">Try-on photos</h1>
          <Add />
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="lg:max-w-sm">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search try-on photos"
            />
          </InputGroup>

          <div className="flex items-center gap-3">
            <Select
              value={String(limit)}
              onValueChange={(value: string) => {
                setLimit(Number(value));
                setPage(1);
              }}
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
            <div className="text-sm text-muted-foreground">
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
            ? PLACEHOLDER_KEYS.map((key) => <TryonCardSkeleton key={key} />)
            : items.map((item) => (
                <TryonCard
                  key={item.id}
                  image={item.image || PLACEHOLDER_IMAGE}
                  name={item.name}
                  category={`${item.type || "Item"} / ${item.fit || "regular"}`}
                  tags={buildTags(item)}
                  onClick={() => setSelectedItem(item)}
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

      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name || "Try-on item"}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description || "No description available."}
            </DialogDescription>
          </DialogHeader>

          {selectedItem ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                <Image
                  alt={selectedItem.name}
                  src={selectedItem.image || PLACEHOLDER_IMAGE}
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
                  <p>
                    <span className="text-muted-foreground">Waist:</span>{" "}
                    {selectedItem.waist || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Rise:</span>{" "}
                    {selectedItem.rise || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Inseam:</span>{" "}
                    {selectedItem.inseam || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Head:</span>{" "}
                    {selectedItem.head || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Shoe:</span>{" "}
                    {selectedItem.shoe || "—"}
                  </p>
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

                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/tryon/edit/${selectedItem.id}`}>
                      <EditIcon /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!selectedItem) return;
                      const ok = confirm(
                        "Delete this item? This cannot be undone.",
                      );
                      if (!ok) return;
                      deleteItem(selectedItem.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
