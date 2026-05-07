import type { CreateTryonInput } from "@/lib/zod/tryon";

export type TryonItem = {
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
  waist: string | null;
  rise: string | null;
  inseam: string | null;
  head: string | null;
  shoe: string | null;
};

export type TryonListResponse = {
  message: string;
  data: TryonItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type GetTryonItemsParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export async function createTryonItem(
  data: CreateTryonInput,
  imageFile: File | null
) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description || "");
  formData.append("isPublic", String(data.isPublic));
  formData.append("type", data.type || "");
  formData.append("size", data.size || "");
  formData.append("fit", data.fit || "");
  formData.append("chest", data.chest || "");
  formData.append("shoulder", data.shoulder || "");
  formData.append("sleeve", data.sleeve || "");
  formData.append("waist", data.waist || "");
  formData.append("rise", data.rise || "");
  formData.append("inseam", data.inseam || "");
  formData.append("head", data.head || "");
  formData.append("shoe", data.shoe || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch("/api/tryon", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create try-on photo");
  }

  return res.json();
}

export async function getTryonItems({
  page = 1,
  limit = 12,
  q = "",
}: GetTryonItemsParams = {}): Promise<TryonListResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (q.trim()) {
    searchParams.set("q", q.trim());
  }

  const res = await fetch(`/api/tryon?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch try-on photos");
  }

  return res.json();
}

export async function getTryonItem(id: string): Promise<{ message: string; data: TryonItem }> {
  const res = await fetch(`/api/tryon/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch try-on item");
  }

  return res.json();
}

export async function updateTryonItem(
  id: string,
  data: Partial<CreateTryonInput>,
  imageFile: File | null,
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
  if (data.waist !== undefined) formData.append("waist", data.waist || "");
  if (data.rise !== undefined) formData.append("rise", data.rise || "");
  if (data.inseam !== undefined) formData.append("inseam", data.inseam || "");
  if (data.head !== undefined) formData.append("head", data.head || "");
  if (data.shoe !== undefined) formData.append("shoe", data.shoe || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch(`/api/tryon/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update try-on item");
  }

  return res.json();
}

export async function deleteTryonItem(id: string) {
  const res = await fetch(`/api/tryon/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete try-on item");
  }

  return res.json();
}