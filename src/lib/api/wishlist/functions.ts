export type WishlistItem = {
  id: string;
  authorId: string;
  closetItemId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  name: string;
  description: string | null;
  isPublic: boolean;
  image: string;
  type: string | null;
  size: string | null;
  fit: string | null;
  chest: string | null;
  shoulder: string | null;
  sleeve: string | null;
  url: string | null;
  priority: string | null;
};

export type WishlistListResponse = {
  message: string;
  data: WishlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type GetWishlistItemsParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export type CreateWishlistPayload = {
  closetItemId: string;
};

export async function createWishlistItem(data: CreateWishlistPayload) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to add wishlist item");
  }

  return res.json();
}

export async function removeWishlistItem(idOrClosetItemId: string) {
  const res = await fetch(`/api/wishlist/${encodeURIComponent(idOrClosetItemId)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to remove wishlist item");
  }

  return res.json();
}

export async function toggleWishlistItem(closetItemId: string, isActive: boolean) {
  if (isActive) {
    return removeWishlistItem(closetItemId);
  }

  return createWishlistItem({ closetItemId });
}

export async function getWishlistItems({
  page = 1,
  limit = 12,
  q = "",
}: GetWishlistItemsParams = {}): Promise<WishlistListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (q.trim()) {
    searchParams.set("q", q.trim());
  }

  const res = await fetch(`/api/wishlist?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch wishlist items");
  }

  return res.json();
}

export async function getWishlistItem(id: string): Promise<{ message: string; data: WishlistItem }> {
  const res = await fetch(`/api/wishlist/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch wishlist item");
  }

  return res.json();
}

export async function updateWishlistItem(
  _id: string,
  _data: unknown,
  _imageFile: File | null
) {
  throw new Error("Updating wishlist item details is not supported in like mode");
}

export async function deleteWishlistItem(id: string) {
  return removeWishlistItem(id);
}

export async function checkIfInWishlist(closetItemId: string): Promise<{
  isInWishlist: boolean;
  wishlistItemId: string | null;
}> {
  const result = await getWishlistItems({ limit: 1000 });
  const item = result.data.find((it) => it.closetItemId === closetItemId);
  return {
    isInWishlist: !!item,
    wishlistItemId: item?.id || null,
  };
}


export async function createStudio({data}:{data:{
    tryon: {
        id: string;
        imgUrl: string;
    } | null;
    closet: {
        id: string;
        imgUrl: string;
    }[];
    caption: string;
}}){
 const res = await fetch("/api/studio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to generate studio image");
    }
    
    return res.json();
}
