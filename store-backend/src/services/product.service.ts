import { prisma } from "../lib/prisma.js";

type ProductFilters = {
  metadata?: { [key: string]: string } | undefined;
  order?: string | undefined;
  limit?: number | undefined;
};

export const getAllProducts = async (filters: ProductFilters) => {
  // Organize ORDER
  let orderBy = {};
  switch (filters.order) {
    case "views":
    default:
      orderBy = { viewsCount: "desc" };
      break;
    case "selling":
      orderBy = { salesCount: "desc" };
      break;
    case "price":
      orderBy = { price: "asc" };
      break;
  }

  // Organize Metadata
  let where: any = {};
  if (filters.metadata && typeof filters.metadata === "object") {
    let metaFilters = [];
    for (let categoryMetadataId in filters.metadata) {
      const value = filters.metadata[categoryMetadataId];
      if (typeof value !== "string") continue;
      const valueIds = value
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);
      if (valueIds.length === 0) continue;

      metaFilters.push({
        metadata: {
          some: {
            categoryMetadataId,
            metadataValueId: { in: valueIds },
          },
        },
      });
    }
    if (metaFilters.length > 0) where.AND = metaFilters;
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      label: true,
      price: true,
      productImages: {
        take: 1,
        orderBy: { id: "asc" },
      },
    },
    where,
    orderBy,
    ...(filters.limit ? { take: filters.limit } : {}),
  });

  return products.map((product) => ({
    id: product.id,
    label: product.label,
    price: product.price,
    image: product.productImages[0]
      ? `media/products/${product.productImages[0].url}`
      : null,
    productImages: undefined,
  }));
};

export const getProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      price: true,
      description: true,
      categoryId: true,
      productImages: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    images:
      product.productImages.length > 0
        ? product.productImages.map((img) => `media/products/${img.url}`)
        : [],
  };
};

export const incrementProductViews = async (id: number) => {
  await prisma.product.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  });
};

export const getProductsFromSameCategory = async (
  id: number,
  limit: number = 4,
) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { categoryId: true },
  });

  if (!product) return [];

  const products = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
    },
    select: {
      id: true,
      label: true,
      price: true,
      productImages: {
        take: 1,
        orderBy: { id: "asc" },
      },
    },
    take: limit,
    orderBy: { viewsCount: "desc" },
  });

  return products.map((product) => ({
    ...product,
    image: product.productImages[0]
      ? `media/products/${product.productImages[0].url}`
      : null,
    productImages: undefined,
  }));
};
