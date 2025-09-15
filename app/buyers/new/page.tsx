"use client";

import React, { useState } from "react";
import Link from "next/link";
import { buyerCreateSchema, BuyerCreateInput } from "@/lib/validators/buyer";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";


type FormState = Partial<BuyerCreateInput> & {
  tagsInput?: string; // comma-separated input helper
};

export default function NewBuyerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "1",
    purpose: "Buy",
    timeline: "0-3m",
    source: "Website",
    notes: "",
    tagsInput: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function parseTags(input?: string) {
    if (!input) return undefined;
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // build payload
    const payload: BuyerCreateInput = {
      fullName: form.fullName ?? "",
      email: form.email ?? undefined,
      phone: form.phone ?? "",
      city: form.city!,
      propertyType: form.propertyType!,
      bhk: form.bhk,
      purpose: form.purpose!,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      timeline: form.timeline!,
      source: form.source!,
      notes: form.notes ?? undefined,
      tags: parseTags(form.tagsInput),
    };

    // Client-side zod validation
    const parsed = buyerCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] ?? "form";
        fieldErrors[String(path)] = issue.message;
      });
      setErrors(fieldErrors);
      // focus first invalid field (basic)
      const firstKey = Object.keys(fieldErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
      if (el) el.focus();
      return;
    }

    type ServerIssue = {
  code: string;
  message: string;
  path?: (string | number)[];
};

    // Submit
    setSubmitting(true);
    try {
      const res = await fetch("/api/addBuyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.error ?? "Failed to create buyer");
        if (json?.issues) {
          // attach server-side issues to form
          const fieldErrors: Record<string, string> = {};
          json.issues.forEach((iss: ServerIssue) => {
            fieldErrors[iss.path?.[0] ?? "form"] = iss.message;
          });
          setErrors(fieldErrors);
        }
        setSubmitting(false);
        return;
      }

      // success - navigate back to list
      router.push("/buyers");
    } catch (err) {
      console.error(err);
      setServerError("Network error");
      setSubmitting(false);
    }
  }

  // conditional: only require bhk for Apartment/Villa (helps UX)
  const showBhk = form.propertyType === "Apartment" || form.propertyType === "Villa";

  return (
    <div className="max-w-2xl mx-auto my-2">
     <div className="flex items-center justify-center relative mb-6 ">
  <Link href="/buyers" className="absolute left-0 text-blue-600 hover:underline hover:text-blue-700 flex items-center gap-1">
    <ArrowLeft size={20} />
    Back
  </Link>
  <h1 className="text-2xl font-semibold">New Buyer</h1>
</div>

      <form onSubmit={handleSubmit} aria-describedby={serverError ? "server-error" : undefined} className="space-y-4">
        {serverError && (
          <div id="server-error" role="alert" className="bg-red-100 text-red-800 p-3 rounded">
            {serverError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
           
          />
          {errors.fullName && <p id="err-fullName" className="text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            inputMode="numeric"
          />
          {errors.phone && <p id="err-phone" className="text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="email">Email (optional)</label>
          <input
            id="email"
            name="email"
            value={form.email ?? ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.email && <p id="err-email" className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="city">City</label>
            <select id="city" name="city" value={form.city} onChange={handleChange} className="w-full border rounded p-2">
              <option>Chandigarh</option>
              <option>Mohali</option>
              <option>Zirakpur</option>
              <option>Panchkula</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="propertyType">Property Type</label>
            <select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full border rounded p-2">
              <option>Apartment</option>
              <option>Villa</option>
              <option>Plot</option>
              <option>Office</option>
              <option>Retail</option>
            </select>
          </div>
        </div>

        {showBhk && (
          <div>
            <label className="block text-sm font-medium" htmlFor="bhk">BHK</label>
            <select id="bhk" name="bhk" value={form.bhk!} onChange={handleChange} className="w-full border rounded p-2">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>Studio</option>
            </select>
            {errors.bhk && <p className="text-sm text-red-600">{errors.bhk}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="budgetMin">Budget Min (INR)</label>
            <input id="budgetMin" 
             type="number" name="budgetMin" value={String(form.budgetMin ?? "")} onChange={handleChange} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="budgetMax">Budget Max (INR)</label>
            <input id="budgetMax" 
             type="number" name="budgetMax" value={String(form.budgetMax ?? "")} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.budgetMax && <p className="text-sm text-red-600">{errors.budgetMax}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="timeline">Timeline</label>
            <select id="timeline" name="timeline" value={form.timeline} onChange={handleChange} className="w-full border rounded p-2">
              <option>0-3m</option>
              <option>3-6m</option>
              <option>{">6m"}</option>
              <option>Exploring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="source">Source</label>
            <select id="source" name="source" value={form.source} onChange={handleChange} className="w-full border rounded p-2">
              <option>Website</option>
              <option>Referral</option>
              <option>Walk-in</option>
              <option>Call</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" value={form.notes ?? ""} onChange={handleChange} rows={4} className="w-full border rounded p-2" maxLength={1000} />
          {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="tagsInput">Tags (comma separated)</label>
          <input id="tagsInput" name="tagsInput" value={form.tagsInput ?? ""} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? "Saving…" : "Save"}
          </button>

          <Link href="/buyers" className="text-sm text-gray-700 hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
