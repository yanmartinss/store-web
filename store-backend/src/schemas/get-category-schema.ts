import z from "zod";
import { sanitizeString } from "../utils/sanitize.js";

export const getCategorySchema = z.object({
  slug: z.string().min(1).transform(sanitizeString),
});
