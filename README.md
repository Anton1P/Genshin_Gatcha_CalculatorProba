# Genshin Impact Gacha Simulator

Un simulateur de probabilités ultra-performant pour le système de vœux (gacha) de Genshin Impact, mis à jour avec les règles de la version 5.0+.

## 🌟 Fonctionnalités

- **Méthode de Monte-Carlo** : Exécute 10 000 itérations pour garantir une précision statistique fiable.
- **Règles 5.0+ Intégrées** :
  - **Personnages** : Intègre la mécanique d'"Éclat Capturé" (Capturing Radiance) qui fait passer le 50/50 à un taux de réussite de 55/45.
  - **Armes** : Intègre le nouveau Chemin de l'Incarnation réduit à 1 point de destin (Fate Point) maximum.
- **Chemin Personnalisé (Custom Path)** : Permet de simuler une séquence précise d'objectifs (ex: C0 -> R1 -> C1 -> C2).
- **Calcul du Cashback** : Calcule automatiquement les vœux effectifs en incluant un retour moyen de 9% via les Astéries.
- **Haute Performance** : L'interface ne freeze jamais pendant les calculs grâce à un traitement asynchrone par lots (chunking).

## 🛠️ Stack Technique

- **Framework** : React 19 avec TypeScript (TSX)
- **Styling** : Tailwind CSS (v4)
- **Icônes** : Lucide React
- **Animations** : Motion (Framer Motion)
- **Build Tool** : Vite

## 📂 Structure du Code

Le projet est organisé pour séparer clairement la logique mathématique de l'interface utilisateur.

### `/src/lib/gacha.ts` (Cœur de l'algorithme)
Contient la logique pure de la simulation.
- `getCharProb(pity)` et `getWeaponProb(pity)` : Fonctions qui calculent la probabilité exacte d'obtenir un 5★ à un tirage donné, en appliquant la "Soft Pity" (augmentation drastique des chances à partir de 74 pour les personnages et 63 pour les armes).
- `runSimulationBatch()` : La fonction principale qui exécute un lot (batch) d'itérations. Elle simule chaque vœu un par un, gère les points de destin, les garantis, et l'Éclat Capturé.

### `/src/App.tsx` (Contrôleur Principal)
Gère l'état global de l'application et la boucle de simulation.
- **Exécution Asynchrone** : Pour éviter que le navigateur ne plante en calculant 10 000 itérations d'un coup, la simulation est découpée en lots de 500 itérations via `requestAnimationFrame`. Cela permet de mettre à jour la barre de progression en temps réel et de garder l'UI fluide.

### `/src/components/` (Interface Utilisateur)
- `ConfigPanel.tsx` : Gère les inputs de l'utilisateur (vœux initiaux, pity actuelle, statut garanti).
- `PathBuilder.tsx` : Permet à l'utilisateur de construire sa séquence d'objectifs (C0, R1, etc.) avec des limites strictes (C6 max, R5 max).
- `Results.tsx` : Affiche les taux de réussite finaux sous forme de barres de progression animées avec `motion`.

## 🧮 Détails Mathématiques

- **Bannière Personnage** : Taux de base 0.6%. Soft pity à 74. Hard pity à 90. En cas de perte du 50/50, le prochain est garanti. Si non garanti, les chances sont de 55% (Succès) / 45% (Échec).
- **Bannière Arme** : Taux de base 0.7%. Soft pity à 63. Hard pity à 80. 75% de chances d'obtenir une arme de la bannière, puis 50% d'obtenir l'arme ciblée (soit 37.5% de base). Si l'arme obtenue n'est pas la cible, le point de destin passe à 1, garantissant l'arme ciblée au prochain 5★.
