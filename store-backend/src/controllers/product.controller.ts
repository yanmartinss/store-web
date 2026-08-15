import type { RequestHandler } from "express";
import { getProductSchema } from "../schemas/get-product-schema.js";
import {
  getAllProducts,
  getProduct,
  getProductsFromSameCategory,
  incrementProductViews,
} from "../services/product.service.js";
import { getAbsoluteImgUrl } from "../utils/get-absolute-img-url.js";
import { getOneProductSchema } from "../schemas/get-one-product-schema.js";
import { getCategory } from "../services/category.service.js";
import { getRelatedProductsSchema } from "../schemas/get-related-products-schema.js";
import { getOneProductsQuerySchema } from "../schemas/get-one-product-query-schema.js";

export const getProducts: RequestHandler = async (req, res) => {
  const parseResult = getProductSchema.safeParse(req.query);
  if (!parseResult.success)
    return res.status(400).json({ error: "Parameter validation failed" });

  const { metadata, orderBy, limit, category, search, page } = parseResult.data;

  const parsedLimit = limit ? parseInt(limit) : undefined;
  const parsedMetadata = metadata ? JSON.parse(metadata) : undefined;
  const parsedPage = page ? parseInt(page) : undefined;

  const { products, total } = await getAllProducts({
    metadata: parsedMetadata,
    order: orderBy,
    limit: parsedLimit,
    category,
    search,
    page: parsedPage,
  });

  const productsWithAbsoluteUrl = products.map((product) => ({
    ...product,
    image: product.image ? getAbsoluteImgUrl(product.image) : null,
    liked: false, // TODO: Implement liked functionality, fetch this.
  }));

  res.json({ error: null, products: productsWithAbsoluteUrl, total });
};

export const getOneProduct: RequestHandler = async (req, res) => {
  const paramsResult = getOneProductSchema.safeParse(req.params);
  if (!paramsResult.success)
    return res.status(400).json({ error: "Parameter validation failed" });

  const { id } = paramsResult.data;

  const product = await getProduct(parseInt(id));

  if (!product) return res.status(404).json({ error: "Product not found" });

  const productWithAbsoluteImages = {
    ...product,
    images: product.images.map((img) => getAbsoluteImgUrl(img)),
  };

  const category = await getCategory(product.categoryId);

  await incrementProductViews(product.id);

  res.json({ error: null, product: productWithAbsoluteImages, category });
};

export const getRelatedProducts: RequestHandler = async (req, res) => {
  const paramsResult = getRelatedProductsSchema.safeParse(req.params);
  const queryResult = getOneProductsQuerySchema.safeParse(req.query);

  if (!paramsResult.success || !queryResult.success)
    return res.status(400).json({ error: "Parameter validation failed" });

  const { id } = paramsResult.data;
  const { limit } = queryResult.data;

  const products = await getProductsFromSameCategory(
    parseInt(id),
    limit ? parseInt(limit) : undefined,
  );

  const productsWithAbsoluteUrl = products.map((product) => ({
    ...product,
    image: product.image ? getAbsoluteImgUrl(product.image) : null,
    liked: false, // TODO: Implement liked functionality, fetch this.
  }));

  res.json({ error: null, products: productsWithAbsoluteUrl });
};
