"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { isLate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { COLUMNS, type Card, type CardDraft, type Column } from "@/lib/types";
import { CardItem } from "./CardItem";

function DraggableCard({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={`touch-manipulation select-none ${isDragging ? "opacity-30" : ""}`}>
      <CardItem card={card} onOpen={onOpen} />
    </div>
  );
}

function ColumnTab({ col, count, active, dragging, onClick }: { col: Column; count: number; active: boolean; dragging: boolean; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `tab:${col}` });
  const label = COLUMNS.find((c) => c.id === col)!.label;
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
        isOver ? "scale-105 bg-teal-600 text-white" : active ? "bg-white text-slate-900 shadow" : "text-slate-500"
      } ${dragging && !isOver ? "outline-2 outline-dashed outline-teal-300" : ""}`}
    >
      {label}
      <span className={`rounded-full px-2 py-0.5 text-xs ${isOver ? "bg-white/25" : "bg-slate-200 text-slate-700"}`}>{count}</span>
    </button>
  );
}

function ColumnZone({ col, cards, onOpen }: { col: Column; cards: Card[]; onOpen: (c: Card) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${col}` });
  const label = COLUMNS.find((c) => c.id === col)!.label;
  return (
    <section ref={setNodeRef} className={`flex min-h-[60dvh] flex-col gap-2 rounded-2xl p-2 transition ${isOver ? "bg-teal-100" : "bg-slate-200/60"}`}>
      <h2 className="hidden items-center justify-between px-2 pt-1 text-sm font-bold text-slate-600 md:flex">
        {label}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs">{cards.length}</span>
      </h2>
      {cards.map((c) => (
        <DraggableCard key={c.id} card={c} onOpen={() => onOpen(c)} />
      ))}
      {cards.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Aucune carte</p>}
    </section>
  );
}

const sortCards = (a: Card, b: Card) => {
  const la = isLate(a) ? 0 : 1;
  const lb = isLate(b) ? 0 : 1;
  if (la !== lb) return la - lb;
  const rank = { ko: 0, warn: 1, ok: 2 };
  if (rank[a.health] !== rank[b.health]) return rank[a.health] - rank[b.health];
  return (a.due ?? "9999").localeCompare(b.due ?? "9999");
};

export function Board({ openCard }: { openCard: (d: CardDraft) => void }) {
  const { cards, moveCard } = useStore();
  const [active, setActive] = useState<Column>("todo");
  const [dragId, setDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  const byCol = (col: Column) => cards.filter((c) => c.column === col).sort(sortCards);
  const dragged = cards.find((c) => c.id === dragId);

  const onStart = (e: DragStartEvent) => {
    setDragId(String(e.active.id));
    navigator.vibrate?.(15);
  };
  const onEnd = (e: DragEndEvent) => {
    setDragId(null);
    const target = e.over?.id ? String(e.over.id) : "";
    const col = target.split(":")[1] as Column | undefined;
    if (col) moveCard(String(e.active.id), col);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setDragId(null)}>
      <div className="sticky top-14 z-10 -mx-4 bg-slate-100/95 px-4 pb-2 pt-1 backdrop-blur md:hidden">
        <div className="flex gap-1 rounded-2xl bg-slate-200 p-1">
          {COLUMNS.map((c) => (
            <ColumnTab key={c.id} col={c.id} count={byCol(c.id).length} active={active === c.id} dragging={!!dragId} onClick={() => setActive(c.id)} />
          ))}
        </div>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          {dragId ? "Lâche la carte sur une colonne" : "Appui long sur une carte pour la déplacer, toucher la pastille pour changer le statut"}
        </p>
      </div>

      <div className="md:hidden">
        <ColumnZone col={active} cards={byCol(active)} onOpen={openCard} />
      </div>

      <div className="hidden gap-3 md:grid md:grid-cols-3">
        {COLUMNS.map((c) => (
          <ColumnZone key={c.id} col={c.id} cards={byCol(c.id)} onOpen={openCard} />
        ))}
      </div>

      <DragOverlay>{dragged ? <CardItem card={dragged} lifted /> : null}</DragOverlay>
    </DndContext>
  );
}
