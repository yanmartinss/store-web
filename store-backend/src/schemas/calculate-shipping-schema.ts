import z from "zod";
import { sanitizeString } from "../utils/sanitize.js";

export const calculateShippingSchema = z.object({
  zipcode: z.string().min(4).transform(sanitizeString),
});
