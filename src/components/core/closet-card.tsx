import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon, Share2Icon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";

export type ClosetCardProps = {
  image: string;
  name: string;
  category: string;
  sizes?: string[];
  fallbackImage?: string;
  onClick?: () => void;
  onFavorite?: () => void;
  onAddToCart?: () => void;
  onShare?: () => void;
};

export default function ClosetCard({
  image,
  name,
  category,
  sizes = [],
  fallbackImage = "https://placehold.co/1000x800/png",
  onClick,
  onFavorite,
  onAddToCart,
  onShare,
}: ClosetCardProps) {
  const resolvedImage = image || fallbackImage;

  return (
    <Card
      className="gap-0 py-3 pb-6 transition-transform duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0">
        <Image
          className="h-full w-full rounded-lg! object-contain"
          height={400}
          width={400}
          alt={name}
          src={resolvedImage}
        />
      </CardContent>
      <CardContent className="space-y-2 border-t p-6">
        <h3 className="text-base font-semibold">{name}</h3>
        <p className="text-muted-foreground">{category}</p>
        {sizes.length > 0 ? (
          <div className="space-x-2 space-y-2">
            {sizes.map((size) => (
              <Badge key={size} variant="outline">
                {size}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t">
        <Button
          size="icon"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite?.();
          }}
          type="button"
        >
          <HeartIcon />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart?.();
            }}
            type="button"
          >
            <ShoppingCartIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onShare?.();
            }}
            type="button"
          >
            <Share2Icon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
