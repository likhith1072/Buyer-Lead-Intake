import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { buyers } from "@/src/db/schema";
import { and, eq, sql, asc, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const search = url.searchParams.get("q") ?? "";
    const city = url.searchParams.get("city");
    const propertyType = url.searchParams.get("propertyType");
    const status = url.searchParams.get("status");
    const timeline = url.searchParams.get("timeline");
    const sort = url.searchParams.get("sort") ?? "updatedAt";
    const order = url.searchParams.get("order") ?? "desc";

    const whereClauses: any[] = [];
    if (city) whereClauses.push(eq(buyers.city, city));
    if (propertyType) whereClauses.push(eq(buyers.propertyType, propertyType));
    if (status) whereClauses.push(eq(buyers.status, status));
    if (timeline) whereClauses.push(eq(buyers.timeline, timeline));

    if (search) {
      const term = `%${search.replace(/%/g, "\\%")}%`;
      whereClauses.push(sql`(
        full_name ILIKE ${term} OR
        phone ILIKE ${term} OR
        email ILIKE ${term}
      )`);
    }

    // map sort safely
    const sortColumn = {
      updatedAt: buyers.updatedAt,
      city: buyers.city,
      status: buyers.status,
      propertyType: buyers.propertyType,
    }[sort] ?? buyers.updatedAt;

    const rows = await db
      .select()
      .from(buyers)
      .where(whereClauses.length ? and(...whereClauses) : undefined)
      .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn));

    const headers = [
      "fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"
    ];

    const csvRows = [headers.join(",")];

    for (const r of rows) {
      const tags = Array.isArray(r.tags) ? r.tags.join(",") : "";
      const cols = [
        `"${r.fullName ?? ""}"`,
        `"${r.email ?? ""}"`,
        `"${r.phone ?? ""}"`,
        `"${r.city ?? ""}"`,
        `"${r.propertyType ?? ""}"`,
        `"${r.bhk ?? ""}"`,
        `"${r.purpose ?? ""}"`,
        `${r.budgetMin ?? ""}`,
        `${r.budgetMax ?? ""}`,
        `"${r.timeline ?? ""}"`,
        `"${r.source ?? ""}"`,
        `"${r.notes ?? ""}"`,
        `"${tags}"`,
        `"${r.status ?? ""}"`,
      ];
      csvRows.push(cols.join(","));
    }

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="buyers-export-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    console.error("GET /api/buyers/export", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
