import Stripe from "stripe";
import { getProduct } from "../services/product.service.js";
import type { CartItem } from "../types/cart-item.js";
import { getStripeSecretKey } from "../utils/get-stripe-secret-key.js";
import { getFrontendURL } from "../utils/get-frontend-url.js";

export const stripe = new Stripe(getStripeSecretKey());

type StripeCheckoutSessionParams = {
  cart: CartItem[];
  shippingCost: number;
  orderId: number;
};
export const createStripeCheckoutSession = async ({
  cart,
  shippingCost,
  orderId,
}: StripeCheckoutSessionParams) => {
  let stripeLineItems = [];

  for (let item of cart) {
    const product = await getProduct(item.productId);
    if (product) {
      stripeLineItems.push({
        price_data: {
          product_data: {
            name: product.label,
          },
          currency: "BRL",
          unit_amount: Math.round(product.price * 100), // Stripe expects amount in cents
        },
        quantity: item.quantity,
      });
    }
  }

  if (shippingCost > 0) {
    stripeLineItems.push({
      price_data: {
        product_data: {
          name: "Shipping Cost",
        },
        currency: "BRL",
        unit_amount: Math.round(shippingCost * 100), // Stripe expects amount in cents
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: "payment",
    metadata: {
      orderId: orderId.toString(),
    },
    success_url: `${getFrontendURL()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendURL()}/my-orders`,
  });

  return session;
};

export const getConstructEvent = async (
  rawBody: string,
  sig: string,
  webhookKey: string,
) => {
  try {
    return stripe.webhooks.constructEvent(rawBody, sig, webhookKey);
  } catch {
    return null;
  }
};

export const getStripeCheckoutSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
