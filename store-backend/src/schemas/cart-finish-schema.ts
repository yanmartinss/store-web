import z from "zod";
import { PRODUCT_SIZES } from "./product-sizes.js";

export const cartFinishSchema = z.object({
  addressId: z.number().int(),
  cart: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().min(1),
        size: z.enum(PRODUCT_SIZES).optional(),
      }),
    )
    .nonempty(),
});
