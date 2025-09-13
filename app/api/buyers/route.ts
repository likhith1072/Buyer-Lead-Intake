
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src/index"; 
import { buyers, buyer_history } from "@/src/db/schema";
import { buyerCreateSchema, BuyerCreateInput } from "@/lib/validators/buyer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // Validate
    const parseResult = buyerCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.issues },
        { status: 400 }
      );
    }

    const input: BuyerCreateInput = parseResult.data;

    // Build DB record
    const newBuyerId = uuidv4();
    const now = new Date();

    // Use a transaction to insert buyer and history together
    await db.transaction(async (tx) => {
      await tx.insert(buyers).values({
        id: newBuyerId,
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
        status: input.status ?? "New",
        notes: input.notes ?? null,
        tags: input.tags ?? null,
        ownerId: user.id,
        updatedAt: now,
      });

      // History entry: diff = full initial object (you might prefer `created` action)
      await tx.insert(buyer_history).values({
        id: uuidv4(),
        buyerId: newBuyerId,
        changedBy: user.id,
        changedAt: now,
        diff: {
          action: "create",
          new: input,
        },
      });
    });

    return NextResponse.json({ ok: true, id: newBuyerId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/buyers error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export const runtime = "nodejs";
// Ensure the route runs in Node.js environment for compatibility with 'pg' package