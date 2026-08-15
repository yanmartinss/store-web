import z from "zod";

export const getProductSchema = z.object({
  metadata: z.string().optional(),
  orderBy: z.enum(["views", "selling", "price"]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
});
