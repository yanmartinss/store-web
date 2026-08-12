import type { RequestHandler } from "express";
import {
  getCategoryBySlug,
  getCategoryMetadata,
} from "../services/category.service.js";

export const getCategoryWithMetadata: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;

  const category = await getCategoryBySlug(slug);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const metadata = await getCategoryMetadata(category.id);

  res.json({ error: null, category, metadata });
};
