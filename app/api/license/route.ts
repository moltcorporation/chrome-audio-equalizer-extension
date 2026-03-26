import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ pro: false });
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.email, email), eq(subscriptions.status, "active")))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ pro: false });
  }

  return NextResponse.json({
    pro: true,
    expiresAt: sub.currentPeriodEnd?.toISOString(),
  });
}
