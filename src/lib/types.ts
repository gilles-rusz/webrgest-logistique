export type Column = "todo" | "doing" | "done";
export type Health = "ok" | "warn" | "ko";
export type Letter = "S" | "Q" | "C" | "D" | "P";

export type Card = {
  id: string;
  title: string;
  column: Column;
  health: Health;
  owner: string;
  due: string | null;
  letter: Letter | null;
  createdAt: string;
  doneAt: string | null;
};

export type CardDraft = Omit<Card, "id" | "createdAt" | "doneAt"> & { id?: string };

export type RitualRecord = {
  date: string;
  scores: Partial<Record<Letter, Health>>;
  durationSec: number;
};

export const COLUMNS: { id: Column; label: string }[] = [
  { id: "todo", label: "À faire" },
  { id: "doing", label: "En cours" },
  { id: "done", label: "Fait" },
];

export const HEALTH: Record<Health, { label: string; dot: string; soft: string }> = {
  ok: { label: "Sous contrôle", dot: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warn: { label: "Irritant", dot: "bg-amber-400", soft: "bg-amber-50 text-amber-800 border-amber-200" },
  ko: { label: "Bloquant", dot: "bg-red-500", soft: "bg-red-50 text-red-700 border-red-200" },
};

export const HEALTH_ORDER: Health[] = ["ok", "warn", "ko"];

export const LETTERS: { id: Letter; label: string; hint: string }[] = [
  { id: "S", label: "Sécurité", hint: "Accident, presque-accident, risque" },
  { id: "Q", label: "Qualité", hint: "Défauts, erreurs, réclamations" },
  { id: "C", label: "Coûts", hint: "Casse, pertes, surconsommation" },
  { id: "D", label: "Délais", hint: "Retards, ruptures, objectif du jour" },
  { id: "P", label: "Personnel", hint: "Absences, effectif, formation" },
];

export const nextHealth = (h: Health): Health => (h === "ok" ? "warn" : h === "warn" ? "ko" : "ok");

export const emptyDraft = (patch: Partial<CardDraft> = {}): CardDraft => ({
  title: "",
  column: "todo",
  health: "ok",
  owner: "",
  due: null,
  letter: null,
  ...patch,
});
