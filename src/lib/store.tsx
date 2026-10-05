"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { today, uid } from "./dates";
import { demoState } from "./demo";
import { nextHealth, type Card, type CardDraft, type Column, type RitualRecord } from "./types";

export type State = { team: string; cards: Card[]; rituals: RitualRecord[] };

type Store = State & {
  ready: boolean;
  saveCard: (d: CardDraft) => void;
  moveCard: (id: string, column: Column) => void;
  cycleHealth: (id: string) => void;
  deleteCard: (id: string) => void;
  saveRitual: (r: RitualRecord) => void;
  setTeam: (team: string) => void;
  resetDemo: () => void;
  clearAll: () => void;
};

const KEY = "lean-terrain:v1";
const Ctx = createContext<Store | null>(null);

const withColumn = (c: Card, column: Column): Card => ({
  ...c,
  column,
  doneAt: column === "done" ? c.doneAt ?? today() : null,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ team: "", cards: [], rituals: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setState(raw ? (JSON.parse(raw) as State) : demoState());
    } catch {
      setState(demoState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const saveCard = useCallback((d: CardDraft) => {
    setState((s) => {
      if (d.id) {
        return { ...s, cards: s.cards.map((c) => (c.id === d.id ? withColumn({ ...c, ...d, id: c.id }, d.column) : c)) };
      }
      const created: Card = withColumn({ ...d, id: uid(), createdAt: today(), doneAt: null }, d.column);
      return { ...s, cards: [created, ...s.cards] };
    });
  }, []);

  const moveCard = useCallback((id: string, column: Column) => {
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === id && c.column !== column ? withColumn(c, column) : c)) }));
  }, []);

  const cycleHealth = useCallback((id: string) => {
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === id ? { ...c, health: nextHealth(c.health) } : c)) }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setState((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== id) }));
  }, []);

  const saveRitual = useCallback((r: RitualRecord) => {
    setState((s) => ({ ...s, rituals: [...s.rituals.filter((x) => x.date !== r.date), r].sort((a, b) => a.date.localeCompare(b.date)) }));
  }, []);

  const setTeam = useCallback((team: string) => setState((s) => ({ ...s, team })), []);
  const resetDemo = useCallback(() => setState(demoState()), []);
  const clearAll = useCallback(() => setState((s) => ({ team: s.team, cards: [], rituals: [] })), []);

  const value = useMemo(
    () => ({ ...state, ready, saveCard, moveCard, cycleHealth, deleteCard, saveRitual, setTeam, resetDemo, clearAll }),
    [state, ready, saveCard, moveCard, cycleHealth, deleteCard, saveRitual, setTeam, resetDemo, clearAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}
