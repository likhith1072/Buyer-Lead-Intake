
import { db } from "@/src/index";
import { buyers, buyer_history } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import BuyerForm from "../components/BuyerForm";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BuyerDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await currentUser();
  const { id } = await params;

  const buyer = (await db.select().from(buyers).where(eq(buyers.id, id))).at(0);
  if (!buyer) return <div className="p-6">Not found</div>;

  const history = await db
    .select()
    .from(buyer_history)
    .where(eq(buyer_history.buyerId, id))
    .orderBy(desc(buyer_history.changedAt))
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-6 relative">
       <Link href="/buyers" className="absolute left-0 text-blue-600 hover:underline hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={20} />
          Back
        </Link>
      <h1 className="text-xl font-semibold mb-4 text-center">{buyer.ownerId === user?.id ? "View/Edit":"View"}</h1>
      
      <BuyerForm buyer={buyer} />

      <div className="mt-8">
        <h2 className="font-semibold text-xl text-black mb-2 text-center w-full">Last 5 changes</h2>
        <ul className="space-y-2 text-sm">
          {history.map((h) => (
            <li key={h.id} className="border p-2 rounded">
              <div className="text-gray-600">
                {new Date(h.changedAt).toLocaleString()} by {h.changedBy}
              </div>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(h.diff, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
