import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, Share2Icon, SparklesIcon } from "lucide-react";
import ShareButton from "./share";

type StudioTryon = {
  id: string;
  name: string;
  description?: string | null;
  image: string;
  type?: string | null;
  size?: string | null;
  fit?: string | null;
  chest?: string | null;
  shoulder?: string | null;
  sleeve?: string | null;
  waist?: string | null;
  rise?: string | null;
  inseam?: string | null;
  head?: string | null;
  shoe?: string | null;
};

type StudioClosetItem = {
  id: string;
  name: string;
  description?: string | null;
  image: string;
  type?: string | null;
  size?: string | null;
  fit?: string | null;
  chest?: string | null;
  shoulder?: string | null;
  sleeve?: string | null;
};

type StudioDetail = {
  id: string;
  authorId: string;
  tryonId: string;
  resultImageUrl: string;
  caption?: string | null;
  model?: string | null;
  size?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  tryon: StudioTryon;
  closetItems: StudioClosetItem[];
};

async function getStudioDetail(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/studio/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
  });

  // if (!res.ok) {
  //   return null;
  // }

  const payload = (await res.json()) as { data?: StudioDetail };

  return payload.data ?? null;
}

function buildTryonTags(item: StudioTryon) {
  return [
    item.size,
    item.fit,
    item.type,
    item.chest,
    item.shoulder,
    item.sleeve,
    item.waist,
    item.rise,
    item.inseam,
    item.head,
    item.shoe,
  ].filter(Boolean) as string[];
}

function buildClosetTags(item: StudioClosetItem) {
  return [
    item.size,
    item.fit,
    item.type,
    item.chest,
    item.shoulder,
    item.sleeve,
  ].filter(Boolean) as string[];
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground">{label}</p>

      <div className="text-right text-sm font-medium">{value}</div>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getStudioDetail(id);

  if (!data) {
    notFound();
  }

  const tryonTags = buildTryonTags(data.tryon);

  const createdAt = new Date(data.createdAt).toLocaleString();

  const updatedAt = new Date(data.updatedAt).toLocaleString();

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/studio">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Studio
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={data.status === "completed" ? "default" : "secondary"}
          >
            {data.status}
          </Badge>
          {/* <Badge variant="outline">{data.model || "Unknown model"}</Badge> */}
          <Badge variant="outline">{data.size || "1024x1024"}</Badge>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        {/* RESULT */}
        <Card className="overflow-hidden border-muted/60 bg-muted/10 relative">
          <CardContent className="space-y-4 p-0">
            <div className="relative h-[420px] overflow-hidden bg-background/60 md:h-[540px] xl:h-[760px]">
              <Image
                unoptimized
                src={data.resultImageUrl}
                alt="Generated studio result"
                fill
                className="object-contain"
                priority
              />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs shadow-sm backdrop-blur">
                <SparklesIcon className="size-3 text-amber-400" />
                Generated result
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Studio ID: {data.id}</Badge>

                <Badge variant="secondary">Try-on: {data.tryonId}</Badge>

                <Badge variant="secondary">
                  Items: {data.closetItems.length}
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Virtual Try-on Result
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Generated from selected try-on photo and closet items.
                </p>
              </div>

              <Separator />

              <div className="">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Caption</p>

                  <p className="text-sm font-medium leading-relaxed">
                    {data.caption?.trim()
                      ? data.caption
                      : "No caption provided."}
                  </p>
                </div>

                {/* <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Result image</p>

                  <p className="break-all text-sm font-medium">
                    {data.resultImageUrl}
                  </p>
                </div> */}
              </div>
            </div>
            <ShareButton caption={data.caption ?? ""} />
          </CardContent>
        </Card>

        {/* TRYON */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-amber-400" />

              <h2 className="text-lg font-semibold">Try-on Reference</h2>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-muted/20">
              <div className="relative h-[380px] md:h-[500px] xl:h-[620px]">
                <Image
                  unoptimized
                  src={data.tryon.image}
                  alt={data.tryon.name}
                  fill
                  className="object-contain bg-black/5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{data.tryon.name}</h3>

                {data.tryon.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {data.tryon.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {data.tryon.type || "Uncategorized"}
                </Badge>

                <Badge variant="outline">{data.tryon.fit || "regular"}</Badge>

                <Badge variant="outline">{data.tryon.size || "—"}</Badge>
              </div>

              {tryonTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tryonTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {/* OPTIONAL METADATA */}
            <div className="rounded-2xl border bg-muted/20 p-4">
              <h3 className="mb-3 text-sm font-semibold">Studio Metadata</h3>

              <InfoRow label="Author" value={data.authorId} />

              <InfoRow label="Studio ID" value={data.id} />

              <InfoRow label="Try-on ID" value={data.tryonId} />

              <InfoRow label="Created" value={createdAt} />

              <InfoRow label="Updated" value={updatedAt} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CLOSET */}
      <Card>
        <CardContent className="space-y-6 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-400" />

            <h2 className="text-lg font-semibold">Closet Items</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {data.closetItems.map((item, index) => {
              const tags = buildClosetTags(item);

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden gap-0 transition-all hover:shadow-md"
                >
                  <CardContent className="relative aspect-square bg-muted/20 p-0">
                    <Image
                      unoptimized
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </CardContent>

                  <CardContent className="space-y-3 border-t p-4">
                    <div>
                      <h3 className="line-clamp-1 font-semibold">
                        {item.name}
                      </h3>

                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.type || "Item"}</Badge>

                      <Badge variant="outline">{item.fit || "regular"}</Badge>
                    </div>

                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
