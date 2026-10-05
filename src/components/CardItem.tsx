"use client";

import { CalendarDays, User } from "lucide-react";
import type { ReactNode } from "react";
import { dueLabel, isLate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { HEALTH, type Card } from "@/lib/types";

export function CardItem({ card, onOpen, trailing, lifted }: { card: Card; onOpen?: () => void; trailing?: ReactNode; lifted?: boolean }) {
  const { cycleHealth } = useStore();
  const late = isLate(card);
  const done = card.column === "done";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${
        lifted ? "rotate-1 border-teal-300 shadow-xl" : "border-slate-200 shadow-sm"
      } ${late ? "border-l-4 border-l-red-500" : ""}`}
    >
      <button
        type="button"
        onClick={() => cycleHealth(card.id)}
        aria-label={`Statut : ${HEALTH[card.health].label}. Toucher pour changer`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-90"
      >
        <span className={`h-7 w-7 rounded-full ring-4 ring-white shadow ${HEALTH[card.health].dot}`} />
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 py-1 text-left">
        <p className={`font-semibold leading-snug text-slate-900 ${done ? "text-slate-400 line-through" : ""}`}>{card.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          {card.letter && <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-white">{card.letter}</span>}
          {card.owner && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5">
              <User size={12} />
              {card.owner}
            </span>
          )}
          {card.due && (
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 ${late ? "bg-red-100 text-red-700" : "bg-slate-100"}`}>
              <CalendarDays size={12} />
              {late ? `En retard, ${dueLabel(card.due)}` : dueLabel(card.due)}
            </span>
          )}
        </div>
      </button>

      {trailing}
    </div>
  );
}
