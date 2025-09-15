
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FiltersBar({ initialParams }: { initialParams: Record<string, string | undefined> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialParams.q ?? "");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
      if (q){ params.set("q", q);  params.set("page","1");}
      else params.delete("q");
     
      router.push(`/buyers?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    if (value){ params.set(key, value);  params.set("page","1");}
    else params.delete(key);
    router.push(`/buyers?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center mb-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name/phone/email"
        className="border rounded p-2 w-64"
      />
      <select
        className="border rounded p-2"
        defaultValue={initialParams.city ?? ""}
        onChange={(e) => updateParam("city", e.target.value)}
      >
        <option value="">All cities</option>
        <option>Chandigarh</option>
        <option>Mohali</option>
        <option>Zirakpur</option>
        <option>Panchkula</option>
        <option>Other</option>
      </select>
      <select
        className="border rounded p-2"
        defaultValue={initialParams.propertyType ?? ""}
        onChange={(e) => updateParam("propertyType", e.target.value)}
      >
        <option value="">All property types</option>
        <option>Apartment</option>
        <option>Villa</option>
        <option>Plot</option>
        <option>Office</option>
        <option>Retail</option>
      </select>
      <select
        className="border rounded p-2"
        defaultValue={initialParams.status ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        <option value="">All statuses</option>
        <option>New</option>
        <option>Qualified</option>
        <option>Contacted</option>
        <option>Visited</option>
        <option>Negotiation</option>
        <option>Converted</option>
        <option>Dropped</option>
      </select>
      <select
        className="border rounded p-2"
        defaultValue={initialParams.timeline ?? ""}
        onChange={(e) => updateParam("timeline", e.target.value)}
      >
        <option value="">Any timeline</option>
        <option>0-3m</option>
        <option>3-6m</option>
        <option>&gt;6m</option>
        <option>Exploring</option>
      </select>
    </div>
  );
}
