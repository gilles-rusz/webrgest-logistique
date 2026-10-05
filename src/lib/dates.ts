import type { Card } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => iso(new Date());

export const addDays = (n: number, from: Date = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const fmtShort = (s: string) => {
  const [, m, d] = s.split("-");
  return `${d}/${m}`;
};

export const dueLabel = (due: string) => {
  if (due === today()) return "Aujourd'hui";
  if (due === addDays(1)) return "Demain";
  if (due === addDays(-1)) return "Hier";
  return fmtShort(due);
};

export const isLate = (c: Card) => !!c.due && c.column !== "done" && c.due < today();

export const fmtDuration = (sec: number) => {
  const s = Math.abs(Math.round(sec));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
