export type FriendClosetItem = {
  id: string;
  authorId: string;
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
};

export type FriendClosetListResponse = {
  message: string;
  data: FriendClosetItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type GetFriendClosetItemsParams = {
  page?: number;
  limit?: number;
};

export async function getFriendClosetItems({
  page = 1,
  limit = 100,
}: GetFriendClosetItemsParams = {}): Promise<FriendClosetListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(Math.min(limit, 100))); // Max limit is 100

  const res = await fetch(`/api/friends/closet?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch friend closet items");
  }

  return res.json();
}
