import z from "zod";
import { sanitizeString } from "../utils/sanitize.js";

export const addAddressSchema = z.object({
  zipcode: z.string().transform(sanitizeString),
  street: z.string().transform(sanitizeString),
  number: z.string().transform(sanitizeString),
  city: z.string().transform(sanitizeString),
  state: z.string().transform(sanitizeString),
  country: z.string().transform(sanitizeString),
  complement: z.string().transform(sanitizeString).optional(),
});
