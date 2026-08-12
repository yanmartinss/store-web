import z from "zod";

export const getOneProductsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
});
