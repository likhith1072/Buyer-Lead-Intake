import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src/index";
import { buyers, buyer_history } from "@/src/db/schema";
import { buyerCreateSchema,BuyerCreateInput } from "@/lib/validators/buyer";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rows = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid CSV data" }, { status: 400 });
    }

    if (rows.length > 200) {
  return NextResponse.json({ error: "CSV must have at most 200 rows" }, { status: 400 });
}

    const now = new Date();
    const validData: BuyerCreateInput[] = [];
    const errors: { row: number; message: string }[] = [];

    rows.forEach((row, index) => {
      const parsed = buyerCreateSchema.safeParse({
        fullName: row.fullName,
        email: row.email || undefined,
        phone: row.phone,
        city: row.city,
        propertyType: row.propertyType,
        bhk: row.bhk || undefined,
        purpose: row.purpose,
        budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
        budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
        timeline: row.timeline,
        source: row.source,
        notes: row.notes || undefined,
        tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()) : undefined,
        status: row.status || "New",
      });

      if (parsed.success) {
        validData.push(parsed.data);
      } else {
        parsed.error.issues.forEach((iss) => {
          errors.push({
            row: index + 2, // +2 accounts for CSV header
            message: `${iss.path.join(".")}: ${iss.message}`,
          });
        });
      }
    });

    if (validData.length === 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Insert all valid rows in one transaction
    await db.transaction(async (tx) => {
      for (const buyer of validData) {
        const newBuyerId = uuidv4();
        await tx.insert(buyers).values({
          id: newBuyerId,
          fullName: buyer.fullName,
          email: buyer.email ?? null,
          phone: buyer.phone,
          city: buyer.city,
          propertyType: buyer.propertyType,
          bhk: buyer.bhk ?? null,
          purpose: buyer.purpose,
          budgetMin: buyer.budgetMin ?? null,
          budgetMax: buyer.budgetMax ?? null,
          timeline: buyer.timeline,
          source: buyer.source,
          status: buyer.status ?? "New",
          notes: buyer.notes ?? null,
          tags: buyer.tags ?? null,
          ownerId: user.id,
          updatedAt: now,
        });

        await tx.insert(buyer_history).values({
          id: uuidv4(),
          buyerId: newBuyerId,
          changedBy: user.id,
          changedAt: now,
          diff: { action: "create", new: buyer },
        });
      }
    });

    return NextResponse.json({ insertedCount: validData.length, errors });
  } catch (err) {
    console.error("POST /api/importBuyers error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
