"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { addDays, isLate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import type { Card, CardDraft } from "@/lib/types";
import { CardItem } from "./CardItem";

const FILTERS = [
  { id: "late", label: "En retard", test: (c: Card) => isLate(c) },
  { id: "week", label: "Cette semaine", test: (c: Card) => c.column !== "done" && !!c.due && c.due <= addDays(7) },
  { id: "open", label: "Ouvertes", test: (c: Card) => c.column !== "done" },
  { id: "done", label: "Faites", test: (c: Card) => c.column === "done" },
] as const;

export function Actions({ openCard }: { openCard: (d: CardDraft) => void }) {
  const { cards, moveCard } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("open");
  const [owner, setOwner] = useState("");

  const owners = useMemo(() => [...new Set(cards.map((c) => c.owner).filter(Boolean))].sort(), [cards]);
  const f = FILTERS.find((x) => x.id === filter)!;
  const list = cards
    .filter(f.test)
    .filter((c) => !owner || c.owner === owner)
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));

  return (
    <div className="space-y-3 py-2">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((x) => {
          const n = cards.filter(x.test).length;
          return (
            <button
              key={x.id}
              onClick={() => setFilter(x.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold ${
                filter === x.id ? (x.id === "late" ? "bg-red-600 text-white" : "bg-slate-900 text-white") : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              {x.label}
              <span className={`rounded-full px-1.5 text-xs ${filter === x.id ? "bg-white/20" : "bg-slate-100"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {owners.length > 0 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {["", ...owners].map((o) => (
            <button
              key={o || "all"}
              onClick={() => setOwner(o)}
              className={`min-h-9 shrink-0 rounded-full border px-3 text-sm font-semibold ${
                owner === o ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {o || "Tout le monde"}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {list.map((c) => (
          <CardItem
            key={c.id}
            card={c}
            onOpen={() => openCard(c)}
            trailing={
              <button
                onClick={() => moveCard(c.id, c.column === "done" ? "doing" : "done")}
                aria-label={c.column === "done" ? "Rouvrir" : "Marquer comme fait"}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 active:scale-90 ${
                  c.column === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"
                }`}
              >
                <Check size={24} strokeWidth={3} />
              </button>
            }
          />
        ))}
        {list.length === 0 && <p className="py-12 text-center text-slate-400">Aucune action ici.</p>}
      </div>
    </div>
  );
}
