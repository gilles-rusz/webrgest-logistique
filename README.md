# Web RG Est / Logistique

Prototype d'application de Lean Management pour les équipes terrain (atelier, entrepôt), pensé mobile first.

- **Tableau** : cartes À faire / En cours / Fait, appui long pour glisser une carte, statut vert / orange / rouge en un clic.
- **Rituel** : rituel de début de poste en 5 minutes, minuteur, un clic par indicateur SQCDP, création d'action si rouge, point sur les actions en retard.
- **Actions** : plan d'actions filtrable (en retard, cette semaine, par pilote).
- **KPI** : calculés automatiquement à partir des rituels et des actions.

Les données sont stockées sur l'appareil (localStorage). Des données de démonstration sont chargées au premier lancement.

## Lancer en local

```bash
npm install
npm run dev
```

Stack : Next.js, React, TypeScript, Tailwind CSS, dnd-kit.
