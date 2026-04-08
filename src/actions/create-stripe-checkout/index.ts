"use server";

import { protectedActionClient } from "@/lib/next-safe-action";
import Stripe from "stripe";

export const createStripeCheckout = protectedActionClient.action(
  async ({ ctx }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey) throw new Error("Stripe secret key not found");
    if (!priceId) throw new Error("Missing price ID");
    if (!appUrl) throw new Error("Missing app URL");

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: `${appUrl}/dashboard`,
      cancel_url: `${appUrl}/dashboard`,
      subscription_data: {
        metadata: {
          userId: ctx.user.id,
        },
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });

    return {
      sessionId: session.id,
    };
  },
);
