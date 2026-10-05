import { addDays, uid } from "./dates";
import type { Card, Health, Letter, RitualRecord } from "./types";
import type { State } from "./store";

const card = (c: Omit<Card, "id" | "createdAt">): Card => ({ id: uid(), createdAt: addDays(-7), ...c });

export function demoState(): State {
  const cards: Card[] = [
    card({ title: "Fuite d'huile sur chariot 12", letter: "S", health: "ko", column: "todo", owner: "Karim", due: addDays(-1), doneAt: null }),
    card({ title: "Rupture cartons 600x400", letter: "D", health: "ko", column: "todo", owner: "Sophie", due: addDays(1), doneAt: null }),
    card({ title: "Écart d'inventaire emplacement B14", letter: "C", health: "warn", column: "todo", owner: "Julie", due: addDays(-3), doneAt: null }),
    card({ title: "Étiquettes illisibles en zone réception", letter: "Q", health: "warn", column: "doing", owner: "Julie", due: addDays(2), doneAt: null }),
    card({ title: "Rangement 5S allée C", letter: null, health: "ok", column: "doing", owner: "Marc", due: addDays(0), doneAt: null }),
    card({ title: "Former 2 intérimaires au scanner", letter: "P", health: "ok", column: "doing", owner: "Marc", due: addDays(5), doneAt: null }),
    card({ title: "Remplacer l'éclairage du quai 3", letter: "S", health: "ok", column: "done", owner: "Karim", due: addDays(-2), doneAt: addDays(-2) }),
    card({ title: "Mettre à jour le standard de picking", letter: "Q", health: "ok", column: "done", owner: "Sophie", due: addDays(-1), doneAt: addDays(-1) }),
  ];

  const pattern: Health[] = ["ok", "ok", "ok", "warn", "ok", "ok", "ko", "ok", "ok", "warn", "ok"];
  const letters: Letter[] = ["S", "Q", "C", "D", "P"];
  const rituals: RitualRecord[] = [];
  for (let i = 20; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const scores: RitualRecord["scores"] = {};
    letters.forEach((l, j) => (scores[l] = pattern[(i * 3 + j * 5) % pattern.length]));
    rituals.push({ date: addDays(-i), scores, durationSec: 200 + ((i * 37) % 120) });
  }

  return { team: "Équipe matin, quai 2", cards, rituals };
}
