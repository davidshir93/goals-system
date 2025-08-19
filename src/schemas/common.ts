import { z } from "zod";

export const Id = z.string();

export const ISODate = z.string().datetime({ offset: true });

export const ColorHex = z
  .string()
  .regex(/^#(?:[A-Fa-f0-9]{3}){1,2}$/, "Use a valid hex color (e.g. #0EA5E9)");

export const NonEmptyTrimmed = z.string().trim().min(1);

export const Priority = z.number().int().min(1);

export const IntFromInput = z.preprocess(
  (v) => (typeof v === "string" ? Number(v.trim() || "0") : v),
  z.number().int().nonnegative()
);

export function pct(done: number, planned: number) {
  if (planned <= 0) return 0;
  return Math.min(100, Math.round((done / planned) * 100));
}
