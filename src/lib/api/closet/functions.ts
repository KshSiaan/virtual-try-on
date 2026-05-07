import type { CreateClosetInput } from "@/lib/zod/closet";

export type ClosetItem = {
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
  wish: boolean;
};

export type ClosetListResponse = {
  message: string;
  data: ClosetItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type GetClosetItemsParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export async function createClosetItem(
  data: CreateClosetInput,
  imageFile: File | null
) {
  const formData = new FormData();

  // Add all fields to formData
  formData.append("name", data.name);
  formData.append("description", data.description || "");
  formData.append("isPublic", String(data.isPublic));
  formData.append("type", data.type || "");
  formData.append("size", data.size || "");
  formData.append("fit", data.fit || "");
  formData.append("chest", data.chest || "");
  formData.append("shoulder", data.shoulder || "");
  formData.append("sleeve", data.sleeve || "");

  // Add image file if present
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch("/api/closet", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create closet item");
  }

  return res.json();
}

export async function getClosetItems({
  page = 1,
  limit = 12,
  q = "",
}: GetClosetItemsParams = {}): Promise<ClosetListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (q.trim()) {
    searchParams.set("q", q.trim());
  }

  const res = await fetch(`/api/closet?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch closet items");
  }

  return res.json();
}

export async function getClosetItem(id: string): Promise<{ message: string; data: ClosetItem }> {
  const res = await fetch(`/api/closet/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch closet item");
  }

  return res.json();
}

export async function updateClosetItem(
  id: string,
  data: Partial<CreateClosetInput>,
  imageFile: File | null
) {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.description !== undefined) formData.append("description", data.description || "");
  if (data.isPublic !== undefined) formData.append("isPublic", String(data.isPublic));
  if (data.type !== undefined) formData.append("type", data.type || "");
  if (data.size !== undefined) formData.append("size", data.size || "");
  if (data.fit !== undefined) formData.append("fit", data.fit || "");
  if (data.chest !== undefined) formData.append("chest", data.chest || "");
  if (data.shoulder !== undefined) formData.append("shoulder", data.shoulder || "");
  if (data.sleeve !== undefined) formData.append("sleeve", data.sleeve || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch(`/api/closet/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update closet item");
  }

  return res.json();
}

export async function deleteClosetItem(id: string) {
  const res = await fetch(`/api/closet/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete closet item");
  }

  return res.json();
}
