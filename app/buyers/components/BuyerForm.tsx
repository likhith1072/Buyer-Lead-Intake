// components/BuyerForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BuyerForm({ buyer }: { buyer: any }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...buyer });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/updateBuyer/${buyer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, updatedAt: buyer.updatedAt }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to save");
      } else {
        toast.success("Saved!");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        value={form.fullName || ""}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        placeholder="Full name"
        className="border rounded p-2"
        required
      />
      <input
        value={form.phone || ""}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="Phone"
        className="border rounded p-2"
        required
      />
      <input
        value={form.email || ""}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
        className="border rounded p-2"
      />
      <input
        value={form.city || ""}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        placeholder="City"
        className="border rounded p-2"
      />
      {/* ...repeat for propertyType, bhk, purpose, budgetMin/Max, timeline, source, notes, tags, status */}
      <button
        type="submit"
        disabled={saving}
        className="col-span-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
