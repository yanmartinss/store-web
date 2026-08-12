import type { RequestHandler } from "express";
import { getStripeWebhookSecret } from "../utils/get-stripe-webhook-secret.js";
import { getConstructEvent } from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";

export const stripe: RequestHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookKey = getStripeWebhookSecret();
  const rawBody = req.body;

  const event = await getConstructEvent(rawBody, sig, webhookKey);
  if (event) {
    const session = event.data.object as any;
    const orderId = parseInt(session.metadata?.orderId);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await updateOrderStatus(orderId, "paid");
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await updateOrderStatus(orderId, "cancelled");
        break;
    }
  }

  res.json({ error: null });
};

export const updateOrderStatus = async (
  orderId: number,
  status: "paid" | "cancelled",
) => {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
