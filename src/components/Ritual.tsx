"use client";

import { Check, Play, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dueLabel, fmtDuration, fmtShort, isLate, today } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { HEALTH, HEALTH_ORDER, LETTERS, type CardDraft, type RitualRecord } from "@/lib/types";

const TARGET = 300;

export function Ritual({ openCard }: { openCard: (d: CardDraft) => void }) {
  const { rituals, cards, saveRitual, moveCard } = useStore();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [scores, setScores] = useState<RitualRecord["scores"]>({});
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const todayRecord = rituals.find((r) => r.date === today());
  const last = [...rituals].reverse().find((r) => r.date !== today());
  const late = cards.filter(isLate);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 500);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    setScores(todayRecord?.scores ?? {});
    startedAt.current = Date.now();
    setElapsed(0);
    setPhase("running");
  };

  const finish = () => {
    saveRitual({ date: today(), scores, durationSec: Math.round(elapsed) });
    setPhase("done");
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
          <Check size={40} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold">Rituel enregistré</h2>
        <p className="text-slate-600">Durée : {fmtDuration(elapsed)}. Les KPI sont à jour.</p>
        <button onClick={() => setPhase("idle")} className="mt-2 h-14 rounded-2xl bg-slate-900 px-8 font-bold text-white">
          OK
        </button>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="space-y-4 py-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Rituel de début de poste</p>
          <h2 className="mt-1 text-2xl font-bold leading-tight">5 minutes, 5 indicateurs</h2>
          <p className="mt-2 text-blue-100">Un clic par indicateur, puis le point sur les actions en retard.</p>
          <button onClick={start} className="mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-white text-lg font-bold text-blue-700 shadow active:scale-[0.98]">
            <Play size={24} fill="currentColor" />
            {todayRecord ? "Refaire le rituel du jour" : "Démarrer le rituel"}
          </button>
        </div>

        {todayRecord && <Summary title="Aujourd'hui" record={todayRecord} />}
        {last && <Summary title={`Dernier rituel, ${fmtShort(last.date)}`} record={last} />}
      </div>
    );
  }

  const over = elapsed > TARGET;
  const filled = Object.keys(scores).length;

  return (
    <div className="space-y-3 pb-4">
      <div className="sticky top-14 z-10 -mx-4 bg-slate-100/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className={`font-mono text-4xl font-bold tabular-nums ${over ? "text-red-600" : "text-slate-900"}`}>
            {over ? "+" : ""}
            {fmtDuration(over ? elapsed - TARGET : TARGET - elapsed)}
          </span>
          <span className="text-sm font-semibold text-slate-500">{filled}/5 renseignés</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full transition-all ${over ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${Math.min(100, (elapsed / TARGET) * 100)}%` }} />
        </div>
      </div>

      {LETTERS.map((l) => {
        const v = scores[l.id];
        return (
          <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-xl font-black text-white">{l.id}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{l.label}</p>
                <p className="truncate text-xs text-slate-500">{v ? HEALTH[v].label : l.hint}</p>
              </div>
              <div className="flex gap-1.5">
                {HEALTH_ORDER.map((h) => (
                  <button
                    key={h}
                    onClick={() => setScores({ ...scores, [l.id]: h })}
                    aria-label={`${l.label} : ${HEALTH[h].label}`}
                    className={`h-12 w-12 rounded-full transition active:scale-90 ${HEALTH[h].dot} ${
                      v === h ? "scale-110 ring-4 ring-slate-900/15" : v ? "opacity-25" : "opacity-60"
                    }`}
                  />
                ))}
              </div>
            </div>
            {v === "ko" && (
              <button
                onClick={() => openCard({ title: "", column: "todo", health: "ko", owner: "", due: null, letter: l.id })}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-300 text-sm font-bold text-red-600 active:bg-red-50"
              >
                <Plus size={18} /> Créer une action {l.label.toLowerCase()}
              </button>
            )}
          </div>
        );
      })}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 font-bold">Actions en retard ({late.length})</h3>
        {late.length === 0 && <p className="text-sm text-slate-500">Rien en retard, bravo.</p>}
        <ul className="space-y-2">
          {late.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl bg-red-50 p-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-red-700">
                  {c.owner || "Sans pilote"}, prévu {c.due && dueLabel(c.due)}
                </p>
              </div>
              <button onClick={() => moveCard(c.id, "done")} className="h-10 rounded-lg bg-white px-3 text-sm font-bold text-emerald-700 shadow-sm">
                Fait
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={finish} className="h-16 w-full rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-lg shadow-emerald-600/20 active:bg-emerald-700">
        Terminer le rituel
      </button>
    </div>
  );
}

function Summary({ title, record }: { title: string; record: RitualRecord }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        <span className="text-sm text-slate-500">{fmtDuration(record.durationSec)}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {LETTERS.map((l) => {
          const v = record.scores[l.id];
          return (
            <div key={l.id} className={`grid h-12 place-items-center rounded-xl text-lg font-black ${v ? HEALTH[v].dot + " text-white" : "bg-slate-100 text-slate-400"}`}>
              {l.id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
