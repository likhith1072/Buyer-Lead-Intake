
import { z } from "zod";

export const Cities = [
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
] as const;

export const PropertyTypes = [
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
] as const;

export const BHKs = ["1", "2", "3", "4", "Studio"] as const;

export const Purposes = ["Buy", "Rent"] as const;

export const Timelines = ["0-3m", "3-6m", ">6m", "Exploring"] as const;

export const Sources = ["Website", "Referral", "Walk-in", "Call", "Other"] as const;

export const Statuses = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
] as const;

export const buyerBase = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email({ message: "Invalid email" }).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\d+$/, { message: "Phone must be numeric (digits only)" }),
  city: z.enum(Cities),
  propertyType: z.enum(PropertyTypes),
  bhk: z
    .union([z.enum(BHKs), z.string().optional().nullable()])
    .optional()
    .nullable(),
  purpose: z.enum(Purposes),
  budgetMin: z.number().int().positive().optional().nullable(),
  budgetMax: z.number().int().positive().optional().nullable(),
  timeline: z.enum(Timelines),
  source: z.enum(Sources),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  status: z.enum(Statuses).optional(), // default handled server-side
});

// Combined validation with conditional rules
export const buyerCreateSchema = buyerBase.superRefine((val, ctx) => {
  // bhk required if propertyType is Apartment or Villa
  if (["Apartment", "Villa"].includes(val.propertyType)) {
    if (!val.bhk || val.bhk === null || String(val.bhk).trim() === "") {
      ctx.addIssue({
        code:"custom", 
        message: "BHK is required for Apartment or Villa",
        path: ["bhk"],
      });
    }
  }

  // budgetMax >= budgetMin if both present
  if (
    typeof val.budgetMin === "number" &&
    typeof val.budgetMax === "number" &&
    val.budgetMax < val.budgetMin
  ) {
    ctx.addIssue({
      code: "custom", 
      message: "budgetMax must be greater than or equal to budgetMin",
      path: ["budgetMax"],
    });
  }
});

export type BuyerCreateInput = z.infer<typeof buyerCreateSchema>;
