"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addDays, today } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { COLUMNS, HEALTH, HEALTH_ORDER, LETTERS, type CardDraft } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";

const chip = (active: boolean) =>
  `min-h-11 rounded-xl border px-3 text-sm font-semibold transition active:scale-95 ${
    active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700"
  }`;

export function CardSheet({ draft, onClose }: { draft: CardDraft | null; onClose: () => void }) {
  const { cards, saveCard, deleteCard } = useStore();
  const [d, setD] = useState<CardDraft | null>(draft);

  useEffect(() => setD(draft), [draft]);

  const owners = useMemo(() => [...new Set(cards.map((c) => c.owner).filter(Boolean))].sort(), [cards]);

  if (!d) return null;
  const set = (patch: Partial<CardDraft>) => setD({ ...d, ...patch });
  const quickDates = [
    { label: "Aujourd'hui", value: today() },
    { label: "Demain", value: addDays(1) },
    { label: "Dans 1 semaine", value: addDays(7) },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.title.trim()) return;
    saveCard({ ...d, title: d.title.trim(), owner: d.owner.trim() });
    onClose();
  };

  return (
    <BottomSheet open title={d.id ? "Modifier la carte" : "Nouvelle carte"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <input
          autoFocus={!d.id}
          value={d.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Quel est le problème ou l'action ?"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-500">Statut</legend>
          <div className="grid grid-cols-3 gap-2">
            {HEALTH_ORDER.map((h) => (
              <button
                type="button"
                key={h}
                onClick={() => set({ health: h })}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${
                  d.health === h ? HEALTH[h].soft + " ring-2 ring-offset-1 ring-current" : "border-slate-200 text-slate-600"
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-full ${HEALTH[h].dot}`} />
                {HEALTH[h].label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-500">Colonne</legend>
          <div className="grid grid-cols-3 gap-2">
            {COLUMNS.map((c) => (
              <button type="button" key={c.id} onClick={() => set({ column: c.id })} className={chip(d.column === c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-500">Pilote</legend>
          <input
            list="owners"
            value={d.owner}
            onChange={(e) => set({ owner: e.target.value })}
            placeholder="Prénom"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600"
          />
          <datalist id="owners">
            {owners.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
          {owners.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {owners.map((o) => (
                <button type="button" key={o} onClick={() => set({ owner: o })} className={chip(d.owner === o)}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-500">Échéance</legend>
          <div className="flex flex-wrap gap-2">
            {quickDates.map((q) => (
              <button type="button" key={q.label} onClick={() => set({ due: d.due === q.value ? null : q.value })} className={chip(d.due === q.value)}>
                {q.label}
              </button>
            ))}
            <input
              type="date"
              value={d.due ?? ""}
              onChange={(e) => set({ due: e.target.value || null })}
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
              aria-label="Choisir une date"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-500">Indicateur SQCDP</legend>
          <div className="grid grid-cols-5 gap-2">
            {LETTERS.map((l) => (
              <button
                type="button"
                key={l.id}
                title={l.label}
                onClick={() => set({ letter: d.letter === l.id ? null : l.id })}
                className={chip(d.letter === l.id) + " text-base"}
              >
                {l.id}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 pt-1">
          {d.id && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Supprimer cette carte ?")) {
                  deleteCard(d.id!);
                  onClose();
                }
              }}
              aria-label="Supprimer"
              className="grid h-14 w-14 place-items-center rounded-2xl border border-red-200 text-red-600 active:bg-red-50"
            >
              <Trash2 size={22} />
            </button>
          )}
          <button
            type="submit"
            disabled={!d.title.trim()}
            className="h-14 flex-1 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 active:bg-blue-700 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
