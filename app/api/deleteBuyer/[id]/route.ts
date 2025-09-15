import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { buyers } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

     // Use user.id if logged in, fallback to IP
  const ip = req.headers.get("x-forwarded-for") ?? "unknown-ip";
  const key = user.id ?? ip;

  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

   const { id } = await params;

 const existing = (await db.select().from(buyers).where(eq(buyers.id, id))).at(0);
   

    if (!existing) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (existing.ownerId !== user?.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this record" },
        { status: 403 }
      );
    }

    await db.delete(buyers).where(eq(buyers.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    );
  }
}
