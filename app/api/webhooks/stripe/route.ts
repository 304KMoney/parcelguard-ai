import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const PLAN_LIMITS: Record<string, { plan: string; aiCredits: number }> = {
  starter: { plan: "starter", aiCredits: 50 },
  pro: { plan: "pro", aiCredits: 500 },
  team: { plan: "team", aiCredits: 2500 },
  desk: { plan: "desk", aiCredits: 5000 },
};

function getPlanFromStripeProduct(productId: string): string {
  // Map Stripe product IDs to plan names
  // In production, these would be your actual Stripe product IDs
  if (productId.includes("pro")) return "pro";
  if (productId.includes("team")) return "team";
  if (productId.includes("desk")) return "desk";
  return "starter";
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerkId;
        const planName = session.metadata?.plan ?? "starter";

        if (clerkId) {
          const planConfig = PLAN_LIMITS[planName] ?? PLAN_LIMITS.starter;
          await prisma.user.updateMany({
            where: { clerkId },
            data: {
              plan: planConfig.plan,
              aiCreditsLimit: planConfig.aiCredits,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkId = subscription.metadata?.clerkId;

        if (clerkId && subscription.items.data[0]?.price.product) {
          const productId = subscription.items.data[0].price.product as string;
          const planName = getPlanFromStripeProduct(productId);
          const planConfig = PLAN_LIMITS[planName] ?? PLAN_LIMITS.starter;

          await prisma.user.updateMany({
            where: { clerkId },
            data: {
              plan: planConfig.plan,
              aiCreditsLimit: planConfig.aiCredits,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkId = subscription.metadata?.clerkId;

        if (clerkId) {
          await prisma.user.updateMany({
            where: { clerkId },
            data: {
              plan: "starter",
              aiCreditsLimit: 50,
            },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
