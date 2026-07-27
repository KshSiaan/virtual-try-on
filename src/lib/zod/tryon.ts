import { z } from "zod";

export const createTryonSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  isPublic: z.boolean(),
  type: z.string().max(50, "Type too long").optional(),
  size: z.string().max(20, "Size too long").optional(),
  fit: z.string().max(50, "Fit too long").optional(),
  chest: z.string().max(20, "Chest too long").optional(),
  shoulder: z.string().max(20, "Shoulder too long").optional(),
  sleeve: z.string().max(20, "Sleeve too long").optional(),
  waist: z.string().max(20, "Waist too long").optional(),
  rise: z.string().max(20, "Rise too long").optional(),
  inseam: z.string().max(20, "Inseam too long").optional(),
  head: z.string().max(20, "Head too long").optional(),
  shoe: z.string().max(20, "Shoe too long").optional(),
});

export type CreateTryonInput = z.infer<typeof createTryonSchema>;