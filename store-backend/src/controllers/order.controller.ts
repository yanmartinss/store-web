import type { RequestHandler } from "express";
import { getOrderBySessionIdSchema } from "../schemas/get-order-by-session-id-schema.js";
import { getOrderIdFromSession } from "../services/payment.service.js";
import { getOrderById, getUserOrders } from "../services/order.service.js";
import { getOrderSchema } from "../schemas/get-order-schema.js";
import { getAbsoluteImgUrl } from "../utils/get-absolute-img-url.js";

export const getOrderBySessionId: RequestHandler = async (req, res) => {
  const result = getOrderBySessionIdSchema.safeParse(req.query);
  if (!result.success)
    return res.status(400).json({ error: "Invalid request query" });

  const { session_id } = result.data;

  const orderId = await getOrderIdFromSession(session_id);
  if (!orderId) return res.status(404).json({ error: "Order not found" });

  res.json({ error: null, orderId });
};

export const listOrders: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "Access denied" });

  const orders = await getUserOrders(userId);

  res.json({ error: null, orders });
};

export const getOrder: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "Access denied" });

  const result = getOrderSchema.safeParse(req.params);
  if (!result.success)
    return res.status(400).json({ error: "Invalid request params" });

  const { id } = result.data;

  const order = await getOrderById(parseInt(id), userId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const itemsWithAbsoluteURL = order.orderItems.map((item) => ({
    ...item,
    product: {
      ...item.product,
      image: item.product.image ? getAbsoluteImgUrl(item.product.image) : null,
    },
  }));

  res.json({
    error: null,
    order: {
      ...order,
      orderItems: itemsWithAbsoluteURL,
    },
  });
};
