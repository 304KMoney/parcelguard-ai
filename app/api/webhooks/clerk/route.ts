import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id?: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address ?? "";
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");

    if (clerkId && email) {
      await prisma.user.upsert({
        where: { clerkId },
        update: { email, fullName: fullName || undefined },
        create: {
          clerkId,
          email,
          fullName: fullName || undefined,
          plan: "starter",
          aiCreditsLimit: 50,
        },
      });
    }
  } else if (type === "user.deleted") {
    const clerkId = data.id;
    if (clerkId) {
      await prisma.user.deleteMany({ where: { clerkId } });
    }
  }

  return NextResponse.json({ received: true });
}
