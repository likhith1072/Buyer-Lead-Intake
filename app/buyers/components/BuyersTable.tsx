// components/BuyersTable.tsx
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Buyer } from "@/src/db/schema";  

export default async function BuyersTable({ items }: { items: Buyer[] }) {
  const user = await currentUser();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Phone</th>
            <th className="px-3 py-2 text-left">City</th>
            <th className="px-3 py-2 text-left">Property</th>
            <th className="px-3 py-2 text-left">Budget</th>
            <th className="px-3 py-2 text-left">Timeline</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Updated</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">{b.fullName}</td>
              <td className="px-3 py-2">{b.phone}</td>
              <td className="px-3 py-2">{b.city}</td>
              <td className="px-3 py-2">{b.propertyType}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {b.budgetMin ?? ""} – {b.budgetMax ?? ""}
              </td>
              <td className="px-3 py-2">{b.timeline}</td>
              <td className="px-3 py-2">{b.status}</td>
              <td className="px-3 py-2">{new Date(b.updatedAt!).toLocaleString()}</td>
              <td className="px-3 py-2">
                <Link href={`/buyers/${b.id}`} className="text-blue-600 hover:underline">
                  {b.ownerId === user?.id ?"View/Edit" :"View"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
