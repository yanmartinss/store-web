import z from "zod";
import { PRODUCT_SIZES } from "./product-sizes.js";

export const validateSizeSchema = z.object({
  productId: z.string().regex(/^\d+$/),
  size: z.enum(PRODUCT_SIZES),
});
