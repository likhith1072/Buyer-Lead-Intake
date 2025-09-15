
import { db } from "@/src/index";
import { buyers } from "@/src/db/schema";
import { sql, SQL, and, eq } from "drizzle-orm";
import ImportCSV from "./components/importCSV";
import FiltersBar from "./components/FiltersBar";
import BuyersTable from "./components/BuyersTable";
import Link from "next/link";
import { Download } from "lucide-react";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic"; // SSR

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams; // ✅ await it
  const page = Number(params.page ?? 1);
  const perPage = 10;
  const offset = (page - 1) * perPage;

  const conditions: SQL[] = [];
  if (params.city && typeof params.city === "string") conditions.push(eq(buyers.city, params.city));
  if (params.propertyType && typeof params.propertyType === "string") conditions.push(eq(buyers.propertyType, params.propertyType));
  if (params.status && typeof params.status === "string") conditions.push(eq(buyers.status, params.status));
  if (params.timeline && typeof params.timeline === "string") conditions.push(eq(buyers.timeline, params.timeline));

  if (params.q) {
    const term = `%${params.q}%`;
    conditions.push(
      sql`("full_name" ILIKE ${term} OR "phone" ILIKE ${term} OR "email" ILIKE ${term})`
    );
  }

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined);

  const total = Number(totalRes[0]?.count ?? 0);

  const rows = await db
    .select()
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(sql`"updated_at" DESC`)
    .limit(perPage)
    .offset(offset);

  const totalPages = Math.ceil(total / perPage);

    // export link

  const exportUrl = `/api/exportBuyers?${new URLSearchParams(
    params as Record<string, string>
  ).toString()}`

  const maxVisiblePages=5
  // Calculate page range
  let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let end = start + maxVisiblePages - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  const visiblePages = [];
  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className=" mx-auto sm:px-4 px-2 py-2 w-full ">
      <div className="flex flex-col items-center justify-between mb-4">
         <Link
        href="/buyers/new"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Buyer Lead
      </Link>
        <ImportCSV />
        
      </div>

      <div className="flex items-center justify-between mb-4 gap-2 w-full">
     <FiltersBar initialParams={params as Record<string, string | undefined>} />
       <Link
        href={exportUrl}
        className="sm:px-4 px-2 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 whitespace-nowrap flex items-center justify-center gap-1"
      > 
        <Download className="w-4 h-4" />
        {/* {exporting ? "Exporting..." : "Export CSV"} */}Export CSV
      </Link>
      </div>


      <BuyersTable items={rows} />

      <div className="flex justify-center mt-4
       gap-2 w-full overflow-auto ">
          {/* First button */}
      {start > 1 && (
        <Link
          href={`/buyers?${new URLSearchParams({
            ...params,
            page: "1",
          })}`}
          className="px-3 py-1 border rounded hover:bg-gray-100 flex items-center justify-center gap-1"
        >
          &laquo; <span className="sm:block hidden">First</span>
        </Link>
      )}

       {/* Previous button */}
      <Link
        href={
          page > 1
            ? `/buyers?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              })}`
            : "#"
        }
        className={`px-3 py-1 border rounded ${
          page === 1
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100 "
        } flex items-center justify-center gap-1`}
      >
        &lt; <span className="sm:block hidden">Prev</span>
      </Link>

      {/* Page numbers */}
      {visiblePages.map((p) => (
        <Link
          key={p}
          href={`/buyers?${new URLSearchParams({
            ...params,
            page: String(p),
          })}`}
          className={`px-3 py-1 border rounded ${
            page === p
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {p}
        </Link>
      ))}

      {/* Next button */}
      <Link
        href={
          page < totalPages
            ? `/buyers?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              })}`
            : "#"
        }
        className={`px-3 py-1 border rounded ${
          page === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100 "
        } flex items-center justify-center gap-1`}
      >
       <span className="sm:block hidden">Next</span> &gt;
      </Link>

       {/* Last button */}
      {end < totalPages && (
        <Link
          href={`/buyers?${new URLSearchParams({
            ...params,
            page: String(totalPages),
          })}`}
          className="px-3 py-1 border rounded hover:bg-gray-100 flex items-center justify-center gap-1"
        >
         <span className="sm:block hidden">Last</span> &raquo;
        </Link>
      )}
    </div>
    </div>
  );
}
