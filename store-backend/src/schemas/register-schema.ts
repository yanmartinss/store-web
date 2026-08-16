import z from "zod";
import { sanitizeString } from "../utils/sanitize.js";

export const registerSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeString),
  email: z.email(),
  password: z.string().min(4),
});
