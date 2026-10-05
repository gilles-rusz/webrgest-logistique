"use client";

import { ChartColumn, LayoutGrid, ListChecks, Menu, Plus, Timer } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { isLate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { emptyDraft, type CardDraft } from "@/lib/types";
import { Actions } from "./Actions";
import { Board } from "./Board";
import { BottomSheet } from "./BottomSheet";
import { CardSheet } from "./CardSheet";
import { Kpi } from "./Kpi";
import { Ritual } from "./Ritual";

const TABS = [
  { id: "board", label: "Tableau", icon: LayoutGrid },
  { id: "ritual", label: "Rituel", icon: Timer },
  { id: "actions", label: "Actions", icon: ListChecks },
  { id: "kpi", label: "KPI", icon: ChartColumn },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>("board");
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [menu, setMenu] = useState(false);
  const late = store.cards.filter(isLate).length;

  if (!store.ready) return <div className="min-h-dvh bg-slate-100" />;

  return (
    <div className="min-h-dvh bg-slate-100 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-slate-900">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-[#141729] px-4 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-teal-300/20 bg-[#141729] shadow-[0_0_20px_rgba(45,212,191,0.15)]">
            <Image src="/globe.png" alt="" width={36} height={36} priority />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-black leading-tight tracking-wide">
              WEB RG EST <span className="font-semibold italic tracking-normal text-[#E8B84B]">/ Logistique</span>
            </p>
            <p className="truncate text-xs text-slate-400">{store.team || "Mon équipe"}</p>
          </div>
        </div>
        <button onClick={() => setMenu(true)} aria-label="Réglages" className="grid h-10 w-10 place-items-center rounded-full active:bg-white/10">
          <Menu size={22} />
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-3">
        {tab === "board" && <Board openCard={setDraft} />}
        {tab === "ritual" && <Ritual openCard={setDraft} />}
        {tab === "actions" && <Actions openCard={setDraft} />}
        {tab === "kpi" && <Kpi />}
      </main>

      {(tab === "board" || tab === "actions") && (
        <button
          onClick={() => setDraft(emptyDraft())}
          aria-label="Nouvelle carte"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 grid h-16 w-16 place-items-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-600/30 active:scale-90"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-bold ${tab === id ? "text-teal-600" : "text-slate-500"}`}
            >
              <Icon size={24} strokeWidth={tab === id ? 2.5 : 2} />
              {label}
              {id === "actions" && late > 0 && (
                <span className="absolute right-[calc(50%-22px)] top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] text-white">{late}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <CardSheet draft={draft} onClose={() => setDraft(null)} />

      <BottomSheet open={menu} onClose={() => setMenu(false)} title="Réglages">
        <label className="mb-2 block text-sm font-semibold text-slate-500" htmlFor="team">
          Nom de l&apos;équipe
        </label>
        <input
          id="team"
          value={store.team}
          onChange={(e) => store.setTeam(e.target.value)}
          className="mb-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-teal-600"
        />
        <div className="space-y-2">
          <button
            onClick={() => {
              store.resetDemo();
              setMenu(false);
            }}
            className="h-12 w-full rounded-xl bg-slate-100 font-semibold active:bg-slate-200"
          >
            Recharger les données de démonstration
          </button>
          <button
            onClick={() => {
              if (confirm("Effacer toutes les cartes et tous les rituels ?")) {
                store.clearAll();
                setMenu(false);
              }
            }}
            className="h-12 w-full rounded-xl border border-red-200 font-semibold text-red-600 active:bg-red-50"
          >
            Tout effacer et partir de zéro
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400">Prototype : les données restent sur cet appareil.</p>
      </BottomSheet>
    </div>
  );
}
