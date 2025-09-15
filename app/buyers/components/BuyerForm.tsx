"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { buyerCreateSchema, BuyerCreateInput } from "@/lib/validators/buyer";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Trash2 } from "lucide-react";
import { Buyer } from "@/src/db/schema";  

type FormState = Partial<BuyerCreateInput> & {
  tagsInput?: string; // helper for comma-separated input
};

export default function BuyerForm({ buyer }: { buyer: Buyer }) { 
  const router = useRouter();
  const { user } = useUser();

  // check ownership
  const isOwner = buyer.ownerId === user?.id;

  // form state
   const [form, setForm] = useState<FormState>({
    fullName: buyer.fullName,
    email: buyer.email ?? undefined,
    phone: buyer.phone,
    city: buyer.city as BuyerCreateInput["city"], // cast to match union type
    propertyType: buyer.propertyType as BuyerCreateInput["propertyType"],
    bhk: buyer.bhk ?? undefined,
    purpose: buyer.purpose as BuyerCreateInput["purpose"],
    budgetMin: buyer.budgetMin ?? undefined,
    budgetMax: buyer.budgetMax ?? undefined,
    timeline: buyer.timeline as BuyerCreateInput["timeline"],
    source: buyer.source as BuyerCreateInput["source"],
    status: buyer.status as BuyerCreateInput["status"],
    notes: buyer.notes ?? undefined,
    tags: buyer.tags ?? undefined,
    tagsInput: buyer.tags?.join(", ") ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // edit mode toggle (default: view mode)
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // ✅ new state for modal
  const [deleting, setDeleting] = useState(false); // to handle delete state

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
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

    // build payload like in newForm
    const payload: BuyerCreateInput = {
      fullName: form.fullName ?? "",
      email: form.email ?? undefined,
      phone: form.phone ?? "",
      city: form.city as BuyerCreateInput["city"],
      propertyType: form.propertyType as BuyerCreateInput["propertyType"],
      bhk: form.bhk as BuyerCreateInput["bhk"],
      purpose: form.purpose as BuyerCreateInput["purpose"],
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      timeline: form.timeline as BuyerCreateInput["timeline"],
      source: form.source as BuyerCreateInput["source"],
      notes: form.notes ?? undefined,
      tags: parseTags(form.tagsInput),
      status: form.status ?? buyer.status as BuyerCreateInput["status"],

    };

    // validate with zod
    const parsed = buyerCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] ?? "form";
        fieldErrors[String(path)] = issue.message;
      });
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      const el = document.querySelector(
        `[name="${firstKey}"]`
      ) as HTMLElement | null;
      if (el) el.focus();
      return;
    }

    const finalPayload = {
      ...parsed.data,
      updatedAt: buyer.updatedAt ? new Date(buyer.updatedAt).toISOString() : undefined, // important to include
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/updateBuyer/${buyer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.error ?? "Failed to save buyer");
        if (json?.issues) {
          const fieldErrors: Record<string, string> = {};
          json.issues.forEach((iss: any) => {
            fieldErrors[iss.path?.[0] ?? "form"] = iss.message;
          });
          setErrors(fieldErrors);
        }
        setSaving(false);
        return;
      }

      toast.success("Saved!",
        { position: "top-right" });
      setEditMode(false);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, { position: "top-right" });
      } else {
        // fallback for unknown types
        toast.error("An unexpected error occurred", { position: "top-right" });
      } }finally {
        setSaving(false);
      }
    }

    const showBhk =
      form.propertyType === "Apartment" || form.propertyType === "Villa";

    async function handleDelete() {
      try {
        setShowConfirm(false);
        setDeleting(true);
        const res = await fetch(`/api/deleteBuyer/${buyer.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          setDeleting(false);
          const json = await res.json();
          toast.error(json.error ?? "Failed to delete");
          return;
        }
        setDeleting(false);
        toast.success("Buyer Lead deleted");
        router.replace("/buyers"); // ✅ navigate back
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Network error while deleting");
      }
    }

    const readonly = !editMode || !isOwner;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Checkbox for edit/view mode if owner */}
        {isOwner && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                id="editMode"
                type="checkbox"
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                className="mr-2 cursor-pointer"
              />
              <label htmlFor="editMode" className="cursor-pointer">Edit mode</label>
            </div>
            {editMode && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 bg-red-500 text-white text-sm rounded shadow hover:bg-red-600 transition "
                disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-1" />
                {deleting ? "Deleting..." : "Delete"}
              </button>)}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          aria-describedby={serverError ? "server-error" : undefined}
          className="space-y-4"
        >
          {serverError && (
            <div
              id="server-error"
              role="alert"
              className="bg-red-100 text-red-800 p-3 rounded"
            >
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
              readOnly={readonly}
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
              readOnly={readonly}
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
              readOnly={readonly}
            />
            {errors.email && <p id="err-email" className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="city">City</label>
              <select id="city" name="city" value={form.city} onChange={handleChange} className="w-full border rounded p-2" disabled={readonly}>
                <option>Chandigarh</option>
                <option>Mohali</option>
                <option>Zirakpur</option>
                <option>Panchkula</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="propertyType">Property Type</label>
              <select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full border rounded p-2" disabled={readonly}>
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
              <select id="bhk" name="bhk" value={form.bhk!} onChange={handleChange} className="w-full border rounded p-2" disabled={readonly}>
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
                type="number" name="budgetMin" value={String(form.budgetMin ?? "")} onChange={handleChange} className="w-full border rounded p-2" readOnly={readonly} />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="budgetMax">Budget Max (INR)</label>
              <input id="budgetMax"
                type="number" name="budgetMax" value={String(form.budgetMax ?? "")} onChange={handleChange} className="w-full border rounded p-2" readOnly={readonly} />
              {errors.budgetMax && <p className="text-sm text-red-600">{errors.budgetMax}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="timeline">Timeline</label>
              <select id="timeline" name="timeline" value={form.timeline} onChange={handleChange} className="w-full border rounded p-2" disabled={readonly}>
                <option>0-3m</option>
                <option>3-6m</option>
                <option>{">6m"}</option>
                <option>Exploring</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="source">Source</label>
              <select id="source" name="source" value={form.source} onChange={handleChange} className="w-full border rounded p-2" disabled={readonly}>
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
            <textarea id="notes" name="notes" value={form.notes ?? ""} onChange={handleChange} rows={4} className="w-full border rounded p-2" maxLength={1000} readOnly={readonly} />
            {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="tagsInput">Tags (comma separated)</label>
            <input id="tagsInput" name="tagsInput" value={form.tagsInput ?? ""} onChange={handleChange} className="w-full border rounded p-2" readOnly={readonly} />
          </div>

          {/* Save button only in edit mode */}
          {editMode && isOwner && (
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </form>
        {/* Delete confirmation modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 " onClick={() => setShowConfirm(false)}>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()} >
              <h2 className="text-lg `font-semibold mb-4" >
                Are you sure you want to delete this Buyer Lead?
              </h2>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
