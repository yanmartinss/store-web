import z from "zod";
import { sanitizeString } from "../utils/sanitize.js";

export const getProductSchema = z.object({
  metadata: z.string().optional(),
  orderBy: z.enum(["views", "selling", "price"]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  category: z.string().transform(sanitizeString).optional(),
  search: z.string().transform(sanitizeString).optional(),
  page: z.string().regex(/^\d+$/).optional(),
});
