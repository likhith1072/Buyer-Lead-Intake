import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { buyers, buyer_history } from "@/src/db/schema";
import { buyerCreateSchema,BuyerCreateInput} from "@/lib/validators/buyer";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function PUT(req: Request, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    // Expect body to contain updated fields plus updatedAt for concurrency check
    const parsed = buyerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }
    const input = parsed.data;

    // fetch existing
    const existing = (await db.select().from(buyers).where(eq(buyers.id, id))).at(0);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ownership check
    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: "You are not allowed to Edit this Buyer Lead" }, { status: 403 });
    }

// concurrency check: require client send updatedAt (ISO) and match existing
const clientUpdatedAt = body.updatedAt;
const serverUpdatedAt = existing.updatedAt?.toISOString();

if (clientUpdatedAt !== serverUpdatedAt) {
  return NextResponse.json(
    { 
      error: `Stale record. Please refresh. clientUpdatedAt: ${clientUpdatedAt}, serverUpdatedAt: ${serverUpdatedAt}`, 
      statusCode: 409 
    },
    { status: 409 }
  );
}


    const now = new Date();

    // compute diff (simple)
    type Diff<T> = Partial<
  Record<keyof T, { old: T[keyof T]; new: T[keyof T] | undefined }>
>;

    const diff:  Diff<BuyerCreateInput> = {};
    (Object.keys(input) as (keyof typeof input)[]).forEach((k) => {
  const oldVal = existing[k];
  const newVal = input[k];

  // deep compare arrays/objects
  const isEqual =
    typeof oldVal === "object" && typeof newVal === "object"
      ? JSON.stringify(oldVal) === JSON.stringify(newVal)
      : oldVal === newVal;

  if (!isEqual) {
    diff[k] = { old: oldVal, new: newVal };
  }
});


    await db.transaction(async (tx) => {
      await tx.update(buyers).set({
        fullName: input.fullName,
        email: input.email ?? null,
        phone: input.phone,
        city: input.city,
        propertyType: input.propertyType,
        bhk: input.bhk ?? null,
        purpose: input.purpose,
        budgetMin: input.budgetMin ?? null,
        budgetMax: input.budgetMax ?? null,
        timeline: input.timeline,
        source: input.source,
        status: input.status ?? existing.status,
        notes: input.notes ?? null,
        tags: input.tags ?? null,
        updatedAt: now,
      }).where(eq(buyers.id, id));

      await tx.insert(buyer_history).values({
        id: uuidv4(),
        buyerId: id,
        changedBy: user.id,
        changedAt: now,
        diff: { action: "update", changes: diff },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
