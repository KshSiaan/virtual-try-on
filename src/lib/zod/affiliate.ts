import { z } from "zod";

export const createAffiliateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  type: z.string().max(50).optional(),
  size: z.string().max(20).optional(),
  fit: z.string().max(50).optional(),
  chest: z.string().max(20).optional(),
  shoulder: z.string().max(20).optional(),
  sleeve: z.string().max(20).optional(),
  affiliateUrl: z.string().url("Must be a valid URL").min(1, "Affiliate URL is required"),
  brand: z.string().max(100).optional(),
  price: z.number().int().min(0).optional(),
  currency: z.string().max(10).optional(),
  storeName: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAffiliateInput = z.infer<typeof createAffiliateSchema>;
