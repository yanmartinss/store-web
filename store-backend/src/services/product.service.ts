import { prisma } from "../lib/prisma.js";

type ProductFilters = {
  metadata?: { [key: string]: string } | undefined;
  order?: string | undefined;
  limit?: number | undefined;
  category?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
};

const PAGE_SIZE = 9;

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
        productMetadata: {
          some: {
            categoryMetadataId,
            metadataValueId: { in: valueIds },
          },
        },
      });
    }
    if (metaFilters.length > 0) where.AND = metaFilters;
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.search) {
    where.label = { contains: filters.search, mode: "insensitive" };
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
    ...(filters.page
      ? { skip: (filters.page - 1) * PAGE_SIZE, take: PAGE_SIZE }
      : filters.limit
        ? { take: filters.limit }
        : {}),
  });

  const total = await prisma.product.count({ where });

  return {
    products: products.map((product) => ({
      id: product.id,
      label: product.label,
      price: product.price,
      image: product.productImages[0]
        ? `media/products/${product.productImages[0].url}`
        : null,
      productImages: undefined,
    })),
    total,
  };
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
      availableSizes: true,
      productImages: true,
      productMetadata: true,
    },
  });

  if (!product) return null;

  const values = await prisma.metadataValue.findMany({
    where: {
      id: { in: product.productMetadata.map((m) => m.metadataValueId) },
    },
    select: { id: true, label: true },
  });
  const labelById = new Map(values.map((value) => [value.id, value.label]));

  return {
    ...product,
    productMetadata: undefined,
    images:
      product.productImages.length > 0
        ? product.productImages.map((img) => `media/products/${img.url}`)
        : [],
    metadata: product.productMetadata.map((meta) => ({
      group: meta.categoryMetadataId,
      valueId: meta.metadataValueId,
      label: labelById.get(meta.metadataValueId) ?? "",
    })),
  };
};

export const isSizeAvailable = async (productId: number, size: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { availableSizes: true },
  });
  if (!product) return false;
  // products without size restrictions accept any size
  if (product.availableSizes.length === 0) return true;
  return product.availableSizes.includes(size);
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
