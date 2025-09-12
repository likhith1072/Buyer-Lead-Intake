import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/index";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      ;

    if (!user || !user[0].password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Normally you'd issue your own JWT or session token here.
    // But since you're using NextAuth, you usually don't need this endpoint.
    return NextResponse.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
