import { dmmfToRuntimeDataModel } from "@prisma/client/runtime/client";
import { prisma } from "../lib/prisma.js";
import type { AddressInput } from "../types/address.js";
import type { CartItem } from "../types/cart-item.js";
import { getProduct } from "./product.service.js";

type CreateOrderParams = {
  userId: number;
  address: AddressInput;
  shippingCost: number;
  shippingDays: number;
  cart: CartItem[];
};

export const createOrder = async ({
  userId,
  address,
  shippingCost,
  shippingDays,
  cart,
}: CreateOrderParams) => {
  let total = 0;
  let orderItems = [];

  for (let cartItem of cart) {
    const product = await getProduct(cartItem.productId);
    if (product) {
      total += product.price * cartItem.quantity;

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
        size: cartItem.size,
      });
    }
  }

  total += shippingCost;

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      shippingCost,
      shippingDays,
      shippingZipcode: address.zipcode,
      shippingStreet: address.street,
      shippingNumber: address.number,
      shippingCity: address.city,
      shippingState: address.state,
      shippingCountry: address.country,
      shippingComplement: address.complement || null,
      orderItems: {
        create: orderItems,
      },
    },
  });

  if (!order) return null;
  return order.id;
};

export const getUserOrders = async (userId: number) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: { id: true, status: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return orders;
};

export const getOrderById = async (id: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      total: true,
      shippingCost: true,
      shippingDays: true,
      shippingCity: true,
      shippingComplement: true,
      shippingCountry: true,
      shippingNumber: true,
      shippingState: true,
      shippingStreet: true,
      shippingZipcode: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              productImages: {
                take: 1,
                orderBy: {
                  id: "asc",
                },
              },
            },
          },
        },
      },
    },
  });
  if (!order) return null;

  return {
    ...order,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.productImages[0]
          ? `media/products/${item.product.productImages[0].url}`
          : null,
        images: undefined,
      },
    })),
  };
};
