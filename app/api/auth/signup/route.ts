import { NextRequest, NextResponse } from "next/server";
import { db } from"@/src/index";
import bcrypt from "bcrypt";
import {users} from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await db.select().from(users).where(eq(users.email, email!));
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning(); 

  return NextResponse.json({ id: user[0].id, email: user[0].email, name: user[0].name });
}
