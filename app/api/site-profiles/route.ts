import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, siteProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

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
  if (!email) return NextResponse.json({ profiles: [] });

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const profiles = await db.select().from(siteProfiles).where(eq(siteProfiles.email, email));
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const { email, sitePattern, eqValues, volume } = await req.json();
  if (!email || !sitePattern || !eqValues) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  // Upsert: update if exists, insert if not
  const existing = await db
    .select()
    .from(siteProfiles)
    .where(and(eq(siteProfiles.email, email), eq(siteProfiles.sitePattern, sitePattern)))
    .limit(1);

  if (existing.length > 0) {
    const [profile] = await db
      .update(siteProfiles)
      .set({ eqValues, volume: volume ?? 0, updatedAt: new Date() })
      .where(eq(siteProfiles.id, existing[0].id))
      .returning();
    return NextResponse.json({ profile });
  }

  const [profile] = await db
    .insert(siteProfiles)
    .values({ email, sitePattern, eqValues, volume: volume ?? 0 })
    .returning();

  return NextResponse.json({ profile });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");
  if (!id || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const isPro = await verifyPro(email);
  if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });

  await db
    .delete(siteProfiles)
    .where(and(eq(siteProfiles.id, parseInt(id)), eq(siteProfiles.email, email)));

  return NextResponse.json({ deleted: true });
}
