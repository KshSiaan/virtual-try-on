"use client";
import React from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SparklesIcon, Share2Icon, CheckIcon, XIcon } from "lucide-react";
import { getClosetItems } from "@/lib/api/closet/functions";
import { getTryonItems } from "@/lib/api/tryon/functions";
import { createStudio, getWishlistItems } from "@/lib/api/wishlist/functions";
import {
  getAffiliateItems,
  type AffiliateProduct,
} from "@/lib/api/affiliates/functions";
import {
  getFriendClosetItems,
  type FriendClosetItem,
} from "@/lib/api/friends/functions";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_CLOSET_ITEMS = 5;

type SelectableItem = {
  id: string;
  image: string;
  name: string;
  subtitle?: string;
  source?: "closet" | "recommendations" | "wishlist" | "affiliate";
};

function SelectionCard({
  image,
  title,
  subtitle,
  selected,
  actionLabel,
  onClick,
}: {
  image: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <Card
      className={`group cursor-pointer gap-0 overflow-hidden transition duration-200 hover:-translate-y-1 ${selected ? "border-emerald-500 ring-2 ring-emerald-500/30" : ""}`}
      onClick={onClick}
    >
      <CardContent className="relative flex h-[32dvh] items-center justify-center bg-muted/20 p-0">
        <Image
          src={image}
          alt={title}
          width={900}
          height={900}
          className="h-full w-full object-contain"
        />
        <div className="absolute left-3 top-3">
          <Badge variant={selected ? "default" : "secondary"}>
            {selected ? "Selected" : actionLabel}
          </Badge>
        </div>
      </CardContent>
      <CardContent className="space-y-2 border-t p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold line-clamp-1">{title}</h3>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {selected ? (
            <CheckIcon className="mt-1 size-4 text-emerald-500" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [page] = React.useState(1);
  const [search] = React.useState("");
  const [limit] = React.useState(9);
  const [caption, setCaption] = React.useState("");
  const [selectedTryon, setSelectedTryon] = React.useState<{
    id: string;
    imgUrl: string;
    name: string;
  } | null>(null);
  const [selectedClosetItems, setSelectedClosetItems] = React.useState<
    {
      id: string;
      imgUrl: string;
      name: string;
      source?: "closet" | "recommendations" | "wishlist" | "affiliate";
    }[]
  >([]);
  const deferredSearch = React.useDeferredValue(search);

  const [tryonpage] = React.useState(1);
  const [tryonsearch] = React.useState("");
  const [tryonlimit] = React.useState(9);
  const tryondeferredSearch = React.useDeferredValue(tryonsearch);

  const { data: tryonData, isLoading: isTryonLoading } = useQuery({
    queryKey: ["tryon-items", tryonpage, tryonlimit, tryondeferredSearch],
    queryFn: () =>
      getTryonItems({
        page: tryonpage,
        limit: tryonlimit,
        q: tryondeferredSearch,
      }),
    placeholderData: (previous) => previous,
  });

  const { data: closetData } = useQuery({
    queryKey: ["closet-items", page, limit, deferredSearch],
    queryFn: () => getClosetItems({ page, limit, q: deferredSearch }),
    placeholderData: (previous) => previous,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: () => getWishlistItems({ limit: 100 }),
  });

  const { data: affiliateData } = useQuery({
    queryKey: ["affiliate-items"],
    queryFn: () => getAffiliateItems({ limit: 48 }),
  });

  const { data: friendClosetData } = useQuery({
    queryKey: ["friend-closet-items"],
    queryFn: () => getFriendClosetItems({ limit: 100 }),
  });

  const tryonItems = tryonData?.data ?? [];
  const closetItems = closetData?.data ?? [];
  const wishlistItems: SelectableItem[] = (wishlistData?.data ?? []).map(
    (item) => ({
      id: item.id,
      image: item.image,
      name: item.name,
      subtitle: item.type || undefined,
      source: "wishlist",
    }),
  );
  const affiliateItems: SelectableItem[] = (affiliateData?.data ?? []).map(
    (item: AffiliateProduct) => ({
      id: item.id,
      image: item.image,
      name: item.name,
      subtitle: item.brand || undefined,
      source: "affiliate",
    }),
  );
  const friendClosetItems: SelectableItem[] = (
    friendClosetData?.data ?? []
  ).map((item: FriendClosetItem) => ({
    id: item.id,
    image: item.image,
    name: item.name,
    subtitle: item.type || undefined,
    source: "recommendations",
  }));

  const { mutate, isPending } = useMutation({
    mutationKey: ["studio"],
    mutationFn: () => {
      return createStudio({ data: submitPayload });
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to complete this request");
    },
    onSuccess: (res: {
      success: boolean;
      model: string;
      size: string;
      studio: {
        id: string;
        authorId: string;
        tryonId: string;
        resultImagePath: string;
        resultImageUrl: string;
        caption: string;
        prompt: string;
        model: string;
        size: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      };
      image: {
        url: string;
        path: string;
      };
    }) => {
      toast.success("Successfully create the image! Redirecting...");
      window.location.href = `/studio/${res.studio.id}`;
    },
  });

  const submitPayload = React.useMemo(
    () => ({
      tryon: selectedTryon
        ? { id: selectedTryon.id, imgUrl: selectedTryon.imgUrl }
        : null,
      closet: selectedClosetItems.map(({ id, imgUrl, source }) => ({
        id,
        imgUrl,
        source,
      })),
      caption,
    }),
    [selectedTryon, selectedClosetItems, caption],
  );

  const toggleTryon = (id: string) => {
    const item = tryonItems.find((it) => it.id === id);
    if (!item) return;
    setSelectedTryon((current) =>
      current?.id === id
        ? null
        : { id: item.id, imgUrl: item.image, name: item.name },
    );
  };

  const toggleCloset = (
    id: string,
    source: "closet" | "wishlist" | "affiliate" | "recommendations",
  ) => {
    let item: SelectableItem | undefined;

    if (source === "closet") {
      const closetItem = closetItems.find((it) => it.id === id);
      if (closetItem) {
        item = {
          id: closetItem.id,
          image: closetItem.image,
          name: closetItem.name,
          source: "closet",
        };
      }
    } else if (source === "wishlist") {
      item = wishlistItems.find((it) => it.id === id);
    } else if (source === "affiliate") {
      item = affiliateItems.find((it) => it.id === id);
    } else if (source === "recommendations") {
      item = friendClosetItems.find((it) => it.id === id);
    }

    if (!item) return;
    setSelectedClosetItems((current) => {
      if (current.some((it) => it.id === id)) {
        return current.filter((it) => it.id !== id);
      }

      if (current.length >= MAX_CLOSET_ITEMS) {
        return current;
      }

      return [
        ...current,
        {
          id: item.id,
          imgUrl: item.image,
          name: item.name,
          source: item.source,
        },
      ];
    });
  };

  const handleSubmit = () => {
    console.log("Studio submit payload", submitPayload);
    mutate();
    toast.info("Generating your virtual try-on...");
  };

  const tryonCards = tryonItems.slice(0, 9);
  return (
    <div className="h-full w-full p-6">
      <h2 className="text-lg font-bold">Compose Studio Outfit</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick 1 try-on photo, pick up to 5 closet items, add caption, submit
        payload.
      </p>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-300" />
            <Label>Choose Try-on Photo</Label>
          </div>

          {isTryonLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading try-on items...
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tryonCards.map((item) => (
              <SelectionCard
                key={item.id}
                image={item.image}
                title={item.name}
                subtitle={`${item.type || "Item"} / ${item.fit || "regular"}`}
                selected={selectedTryon?.id === item.id}
                actionLabel="Select"
                onClick={() => toggleTryon(item.id)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTryon ? (
              <Badge variant="default">
                Selected try-on: {selectedTryon.name}
              </Badge>
            ) : (
              <Badge variant="secondary">No try-on selected</Badge>
            )}
            {selectedTryon ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTryon(null)}
              >
                <XIcon className="size-4" /> Unselect
              </Button>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            Tip: include one full-body front photo and a side angle for better
            fit realism.
          </p>
          <Separator />
          <Label className="">Outfit Caption</Label>
          <Textarea
            placeholder="Type here.."
            className="min-h-24"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          <Separator />
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-300" />
            <Label>
              Choose Items (Closet, Wishlist, Public, or Recommendations)
            </Label>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
            <span>
              {selectedClosetItems.length} / {MAX_CLOSET_ITEMS} items selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedClosetItems([])}
              disabled={selectedClosetItems.length === 0}
            >
              <XIcon className="size-4" /> Clear all
            </Button>
          </div>

          <Tabs defaultValue="closet" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="closet">Closet</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="affiliate">Public</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="closet" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {closetItems.map((item) => {
                  const selected = selectedClosetItems.some(
                    (it) => it.id === item.id,
                  );
                  const actionLabel = selected
                    ? "Unselect"
                    : selectedClosetItems.length >= MAX_CLOSET_ITEMS
                      ? "Max reached"
                      : "Select";
                  return (
                    <SelectionCard
                      key={item.id}
                      image={item.image}
                      title={item.name}
                      subtitle={`${item.type || "Item"} / ${item.fit || "regular"}`}
                      selected={selected}
                      actionLabel={actionLabel}
                      onClick={() => toggleCloset(item.id, "closet")}
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wishlistItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                    No wishlist items yet
                  </p>
                ) : (
                  wishlistItems.map((item) => {
                    const selected = selectedClosetItems.some(
                      (it) => it.id === item.id,
                    );
                    const actionLabel = selected
                      ? "Unselect"
                      : selectedClosetItems.length >= MAX_CLOSET_ITEMS
                        ? "Max reached"
                        : "Select";
                    return (
                      <SelectionCard
                        key={item.id}
                        image={item.image}
                        title={item.name}
                        subtitle={item.subtitle}
                        selected={selected}
                        actionLabel={actionLabel}
                        onClick={() => toggleCloset(item.id, "wishlist")}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="affiliate" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {affiliateItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                    No affiliate items yet
                  </p>
                ) : (
                  affiliateItems.map((item: SelectableItem) => {
                    const selected = selectedClosetItems.some(
                      (it) => it.id === item.id,
                    );
                    const actionLabel = selected
                      ? "Unselect"
                      : selectedClosetItems.length >= MAX_CLOSET_ITEMS
                        ? "Max reached"
                        : "Select";
                    return (
                      <SelectionCard
                        key={item.id}
                        image={item.image}
                        title={item.name}
                        subtitle={item.subtitle}
                        selected={selected}
                        actionLabel={actionLabel}
                        onClick={() => toggleCloset(item.id, "affiliate")}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {friendClosetItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                    No recommendations from friends yet
                  </p>
                ) : (
                  friendClosetItems.map((item: SelectableItem) => {
                    const selected = selectedClosetItems.some(
                      (it) => it.id === item.id,
                    );
                    const actionLabel = selected
                      ? "Unselect"
                      : selectedClosetItems.length >= MAX_CLOSET_ITEMS
                        ? "Max reached"
                        : "Select";
                    return (
                      <SelectionCard
                        key={item.id}
                        image={item.image}
                        title={item.name}
                        subtitle={item.subtitle}
                        selected={selected}
                        actionLabel={actionLabel}
                        onClick={() => toggleCloset(item.id, "recommendations")}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex flex-wrap gap-2">
            {selectedClosetItems.map((item) => (
              <Badge key={item.id} variant="secondary" className="gap-1">
                {item.name}
                <button
                  type="button"
                  onClick={() => toggleCloset(item.id, "closet")}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="space-x-4 flex justify-between">
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedTryon || selectedClosetItems.length === 0 || isPending
            }
          >
            {isPending ? (
              <>
                <Spinner />
                Submitting...
              </>
            ) : (
              "Submit & View Result"
            )}
          </Button>
          <Button variant={"outline"} disabled>
            <Share2Icon />
            Share with Friends
          </Button>
        </CardFooter>
      </Card>
      {/* <pre className="mt-6 overflow-auto rounded-lg border bg-muted/20 p-4 text-xs">
        {JSON.stringify(submitPayload, null, 2)}
      </pre> */}
    </div>
  );
}
