import type { RequestHandler } from "express";
import {
  getCategoryBySlug,
  getCategoryMetadata,
} from "../services/category.service.js";
import { getCategorySchema } from "../schemas/get-category-schema.js";

export const getCategoryWithMetadata: RequestHandler = async (req, res) => {
  const paramsResult = getCategorySchema.safeParse(req.params);
  if (!paramsResult.success)
    return res.status(400).json({ error: "Parameter validation failed" });

  const { slug } = paramsResult.data;

  const category = await getCategoryBySlug(slug);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const metadata = await getCategoryMetadata(category.id);

  res.json({ error: null, category, metadata });
};
