import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, userPresets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function verifyPro(email: string): Promise<boolean> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.email, email), eq(subscriptions.status, "active")))
    .limit(1);
  return !!sub;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ presets: [] });

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const presets = await db.select().from(userPresets).where(eq(userPresets.email, email));
  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  const { email, name, eqValues, volume } = await req.json();
  if (!email || !name || !eqValues) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const [preset] = await db
    .insert(userPresets)
    .values({ email, name, eqValues, volume: volume ?? 0 })
    .returning();

  return NextResponse.json({ preset });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");
  if (!id || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  await db
    .delete(userPresets)
    .where(and(eq(userPresets.id, parseInt(id)), eq(userPresets.email, email)));

  return NextResponse.json({ deleted: true });
}
