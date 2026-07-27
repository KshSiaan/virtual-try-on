import type { CreateAffiliateInput } from "@/lib/zod/affiliate";

export type AffiliateProduct = {
  id: string;
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  name: string;
  description: string | null;
  image: string;
  type: string | null;
  size: string | null;
  fit: string | null;
  chest: string | null;
  shoulder: string | null;
  sleeve: string | null;
  affiliateUrl: string;
  brand: string | null;
  price: number | null;
  currency: string;
  storeName: string | null;
  isActive: boolean;
};

export type AffiliateListResponse = {
  message: string;
  data: AffiliateProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type GetAffiliateItemsParams = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
};

export async function getAffiliateItems({
  page = 1,
  limit = 48,
  q = "",
  type,
}: GetAffiliateItemsParams = {}): Promise<AffiliateListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(Math.min(limit, 48))); // Max limit is 48
  
  if (q.trim()) {
    searchParams.set("q", q.trim());
  }
  
  if (type) {
    searchParams.set("type", type);
  }

  const res = await fetch(`/api/affiliates/public?${searchParams.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch affiliate items");
  }

  return res.json();
}

export async function createAffiliateItem(data: CreateAffiliateInput, imageFile: File | null) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description ?? "");
  formData.append("type", data.type ?? "");
  formData.append("size", data.size ?? "");
  formData.append("fit", data.fit ?? "");
  formData.append("chest", data.chest ?? "");
  formData.append("shoulder", data.shoulder ?? "");
  formData.append("sleeve", data.sleeve ?? "");
  formData.append("affiliateUrl", data.affiliateUrl);
  formData.append("brand", data.brand ?? "");
  if (data.price !== undefined && data.price !== null) {
    formData.append("price", String(data.price));
  }
  formData.append("currency", data.currency ?? "USD");
  formData.append("storeName", data.storeName ?? "");
  formData.append("isActive", String(data.isActive));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch("/api/affiliates", { method: "POST", body: formData });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create affiliate item");
  }

  return res.json();
}

export async function updateAffiliateItem(
  id: string,
  data: Partial<CreateAffiliateInput>,
  imageFile: File | null,
) {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.description !== undefined) formData.append("description", data.description ?? "");
  if (data.type !== undefined) formData.append("type", data.type ?? "");
  if (data.size !== undefined) formData.append("size", data.size ?? "");
  if (data.fit !== undefined) formData.append("fit", data.fit ?? "");
  if (data.chest !== undefined) formData.append("chest", data.chest ?? "");
  if (data.shoulder !== undefined) formData.append("shoulder", data.shoulder ?? "");
  if (data.sleeve !== undefined) formData.append("sleeve", data.sleeve ?? "");
  if (data.affiliateUrl !== undefined) formData.append("affiliateUrl", data.affiliateUrl);
  if (data.brand !== undefined) formData.append("brand", data.brand ?? "");
  if (data.price !== undefined && data.price !== null) formData.append("price", String(data.price));
  if (data.currency !== undefined) formData.append("currency", data.currency ?? "USD");
  if (data.storeName !== undefined) formData.append("storeName", data.storeName ?? "");
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch(`/api/affiliates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update affiliate item");
  }

  return res.json();
}

export async function deleteAffiliateItem(id: string) {
  const res = await fetch(`/api/affiliates/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete affiliate item");
  }

  return res.json();
}
