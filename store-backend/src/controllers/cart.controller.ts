import type { RequestHandler } from "express";
import { cartMountSchema } from "../schemas/cart-mount-schema.js";
import { getProduct } from "../services/product.service.js";
import { getAbsoluteImgUrl } from "../utils/get-absolute-img-url.js";
import { calculateShippingSchema } from "../schemas/calculate-shipping-schema.js";
import { cartFinishSchema } from "../schemas/cart-finish-schema.js";
import { getAddressById } from "../services/user.service.js";
import { createOrder } from "../services/order.service.js";
import { createPaymentLink } from "../services/payment.service.js";

export const cartMount: RequestHandler = async (req, res) => {
  const parseResult = cartMountSchema.safeParse(req.body);

  if (!parseResult.success)
    return res.status(400).json({ error: "Invalid request body" });

  const { ids } = parseResult.data;

  let products = [];
  for (let id of ids) {
    const product = await getProduct(id);
    if (product) {
      products.push({
        id: product.id,
        label: product.label,
        price: product.price,
        image: product.images[0] ? getAbsoluteImgUrl(product.images[0]) : null,
      });
    }
  }

  res.json({ error: null, products });
};

export const calculateShipping: RequestHandler = async (req, res) => {
  const parseResult = calculateShippingSchema.safeParse(req.query);

  if (!parseResult.success)
    return res.status(400).json({ error: "Invalid zipcode" });

  const { zipcode } = parseResult.data;

  res.json({ error: null, zipcode, cost: 7, days: 3 });
};

export const finish: RequestHandler = async (req, res) => {
  const userId = (req as any).userId; // Assuming userId is set in the authMiddleware
  if (!userId) return res.status(401).json({ error: "Access denied" });

  const result = cartFinishSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ error: "Invalid request body" });

  const { cart, addressId } = result.data;

  const address = await getAddressById(userId, addressId);
  if (!address) return res.status(400).json({ error: "Invalid address" });

  const shippingCost = 7; // TODO: temporary fixed shipping cost
  const shippingDays = 3; // TODO: temporary fixed shipping days

  const orderId = await createOrder({
    userId,
    address,
    shippingCost,
    shippingDays,
    cart,
  });

  if (!orderId)
    return res.status(500).json({ error: "Failed to create order" });

  let url = await createPaymentLink({ cart, shippingCost, orderId });

  if (!url)
    return res.status(500).json({ error: "Failed to create payment link" });

  res.status(201).json({ error: null, url });
};
