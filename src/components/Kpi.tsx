"use client";

import { addDays, fmtDuration, fmtShort, isLate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { HEALTH, LETTERS } from "@/lib/types";

const DAYS = 14;

export function Kpi() {
  const { cards, rituals } = useStore();

  const open = cards.filter((c) => c.column !== "done").length;
  const late = cards.filter(isLate).length;
  const doneWeek = cards.filter((c) => c.doneAt && c.doneAt >= addDays(-7)).length;
  const days = Array.from({ length: DAYS }, (_, i) => addDays(i - DAYS + 1));
  const recent = rituals.filter((r) => r.date >= days[0]);
  const month = rituals.filter((r) => r.date >= addDays(-30));
  const avg = recent.length ? recent.reduce((s, r) => s + r.durationSec, 0) / recent.length : 0;

  const tiles = [
    { label: "Actions ouvertes", value: open, tone: "text-slate-900" },
    { label: "En retard", value: late, tone: late ? "text-red-600" : "text-emerald-600" },
    { label: "Faites sur 7 jours", value: doneWeek, tone: "text-emerald-600" },
    { label: "Durée moyenne du rituel", value: recent.length ? fmtDuration(avg) : "-", tone: avg > 300 ? "text-amber-600" : "text-slate-900" },
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className={`text-3xl font-black tabular-nums ${t.tone}`}>{t.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-bold">SQCDP, 14 derniers jours</h2>
          <span className="text-xs text-slate-500">{recent.length} rituels</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th />
                {days.map((d, i) => (
                  <th key={d} className="text-[10px] font-medium text-slate-400">
                    {i % 3 === 0 || i === DAYS - 1 ? fmtShort(d) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LETTERS.map((l) => (
                <tr key={l.id}>
                  <th className="pr-1 text-left text-sm font-black">{l.id}</th>
                  {days.map((d) => {
                    const v = rituals.find((r) => r.date === d)?.scores[l.id];
                    return (
                      <td key={d}>
                        <div title={`${l.label} ${fmtShort(d)}`} className={`h-5 min-w-4 rounded ${v ? HEALTH[v].dot : "bg-slate-100"}`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Jours au vert sur 30 jours</h2>
        <div className="space-y-3">
          {LETTERS.map((l) => {
            const rated = month.filter((r) => r.scores[l.id]);
            const pct = rated.length ? Math.round((rated.filter((r) => r.scores[l.id] === "ok").length / rated.length) * 100) : 0;
            return (
              <div key={l.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{l.label}</span>
                  <span className="font-bold tabular-nums">{rated.length ? `${pct} %` : "-"}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
