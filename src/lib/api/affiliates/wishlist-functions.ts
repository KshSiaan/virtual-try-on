import type { AffiliateProduct } from "./functions";

export type AffiliateWishlistItem = {
  id: string;
  authorId: string;
  affiliateProductId: string;
  createdAt: string | Date;
  product: AffiliateProduct;
};

export async function addAffiliateWishlistItem(affiliateProductId: string) {
  const res = await fetch("/api/affiliates/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ affiliateProductId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to add to wishlist");
  }

  return res.json();
}

export async function removeAffiliateWishlistItem(idOrProductId: string) {
  const res = await fetch(
    `/api/affiliates/wishlist/${encodeURIComponent(idOrProductId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to remove from wishlist");
  }

  return res.json();
}

export async function getAffiliateWishlistedIds(): Promise<string[]> {
  const res = await fetch("/api/affiliates/wishlist?limit=1000", {
    credentials: "include",
  });

  if (!res.ok) return [];

  const json = await res.json();
  return (json.data as AffiliateWishlistItem[]).map((item) => item.affiliateProductId);
}
