# OMEGA — Plateforme pour expatriés à l'île Maurice

> V1 (MVP) full-stack pour démo investisseur. Web (Next.js) + API (Node.js / Express) + Mobile (React Native / Expo).

OMEGA centralise tout ce dont un expatrié a besoin pour s'installer à Maurice :
guides administratifs, communauté locale, et immobilier premium éligible aux permis de résidence.

---

## ✨ Highlights

- **UI/UX premium** — direction artistique SaaS moderne (Inter + Plus Jakarta Sans, palette bleu/turquoise, motion fluide via Framer Motion).
- **Bilingue FR / EN** — toggle de langue persistant dans le `localStorage`.
- **Module Immobilier (priorité MAX)** — cartes type Airbnb, galerie multi-images, fiches détaillées, filtres et tri, favoris persistants.
- **Module Guides** — fiches Notion-like avec étapes numérotées et bloc de conseils.
- **Module Communauté** — feed avec composer (texte + image + tag), likes optimistes.
- **Auth JWT** complète (signup / login / `/me`) + compte de démonstration.
- **Mobile companion** — app Expo avec tabs (Accueil / Biens / Guides / Communauté), reprend les mêmes données.
- **Fallback hors-ligne** — le frontend reste démoable même si le backend n'est pas lancé (mocks intégrés).

---

## 📁 Structure du dépôt

```
omega/
├── backend/      # API REST Node.js + Express (JWT, mock data en mémoire)
├── frontend/     # Web app Next.js 14 (App Router) + Tailwind
├── mobile/       # App Expo (React Native)
└── README.md
```

Architecture pensée comme un vrai monorepo scalable :
chaque app a son propre `package.json`, ses propres dépendances, et communique
via l'API HTTP. Aucun couplage in-process.

---

## 🚀 Démarrage rapide

### Option recommandée — Docker (1 commande)

Le repo embarque un `docker-compose.yml` qui orchestre **backend + frontend + mobile**.

**Pré-requis :** Docker Desktop (Windows / macOS) ou Docker Engine + Compose plugin (Linux).

```bash
docker compose up --build
```

Une fois les images construites, ouvrir :

| Service        | URL                                       |
| -------------- | ----------------------------------------- |
| Web Next.js    | **http://localhost:3000**                 |
| API REST       | **http://localhost:4000/api/health**      |
| Mobile (web)   | **http://localhost:19006**                |

Pour arrêter : `Ctrl+C` puis `docker compose down`.

> Le frontend attend que le backend soit *healthy* (healthcheck `/api/health`) avant de démarrer — pas de race condition au boot.

#### 📱 Tester l'app mobile dans Docker

L'app mobile est dockerisée en deux modes :

**Mode 1 — Web (par défaut, démo zéro-friction) :**
le service `mobile` lance `expo start --web`. L'app React Native est rendue
dans le navigateur via `react-native-web`. Ouvrir simplement
**http://localhost:19006** — aucune installation Expo Go nécessaire.
Idéal pour une démo investisseur sur écran partagé.

**Mode 2 — LAN + Expo Go sur un vrai téléphone :**
pour montrer l'app *vraiment* native sur un smartphone (effet "wow" garanti),
utiliser l'override fourni :

```bash
# 1) Trouvez l'IP LAN de votre ordinateur (celle que voit votre téléphone sur le même Wi-Fi)
#    macOS / Linux :  ipconfig getifaddr en0   |   ip -4 addr
#    Windows :        ipconfig | findstr IPv4

# 2) Exportez-la (à adapter à votre réseau)
export HOST_LAN_IP=192.168.1.42        # Mac/Linux
# setx HOST_LAN_IP 192.168.1.42        # Windows (puis ré-ouvrir le terminal)

# 3) Lancez Compose avec l'override LAN
docker compose -f docker-compose.yml -f docker-compose.mobile-lan.yml up --build
```

Puis :

1. Installez **Expo Go** sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Connectez le téléphone au **même Wi-Fi** que votre ordinateur
3. Scannez le QR code affiché dans les logs du conteneur `omega-mobile`
4. L'app se lance — le téléphone parle au backend à `http://$HOST_LAN_IP:4000`

> ⚠️ Émulateur Android/iOS dans Docker : non géré ici. L'émulateur iOS exige
> macOS natif (verrou Apple), et l'émulateur Android dans Docker exige Linux + KVM —
> trop fragile pour une démo. Préférer le mode Web ou le téléphone physique.

---

### Option manuelle (Node natif)

#### Pré-requis

- Node.js ≥ 18
- npm ≥ 9 (ou yarn / pnpm)
- (Mobile uniquement) [Expo Go](https://expo.dev/client) sur votre téléphone, ou un émulateur iOS/Android

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev          # ou npm start
```

L'API tourne sur **http://localhost:4000**.
Vérifier la santé : `curl http://localhost:4000/api/health`

### 2) Frontend (web)

Dans un nouveau terminal :

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Web app : **http://localhost:3000**

### 3) Mobile (optionnel)

```bash
cd mobile
npm install
npm start            # ouvre Expo Dev Tools
```

Scanner le QR code avec l'app Expo Go.
⚠️ Sur appareil physique, remplacer `localhost` par votre IP locale (ex : `192.168.1.42`)
dans `mobile/src/lib/api.js` pour atteindre le backend.

---

## 🔑 Compte de démonstration

```
email    : demo@omega.mu
password : demo1234
```

Pré-rempli sur l'écran de login.

---

## 🛣️ API REST

Base URL : `http://localhost:4000/api`

| Méthode | Endpoint                 | Auth | Description                            |
| ------- | ------------------------ | ---- | -------------------------------------- |
| GET     | `/health`                | ✗    | Status check                           |
| POST    | `/auth/signup`           | ✗    | Création de compte (email + password)  |
| POST    | `/auth/login`            | ✗    | Connexion → JWT                        |
| GET     | `/auth/me`               | ✓    | Profil de l'utilisateur courant        |
| GET     | `/guides`                | ✗    | Liste des guides (filtres `q`, `category`) |
| GET     | `/guides/:slug`          | ✗    | Guide complet avec étapes et conseils  |
| GET     | `/posts`                 | opt  | Feed communauté                        |
| POST    | `/posts`                 | ✓    | Créer un post                          |
| POST    | `/posts/:id/like`        | ✓    | Toggle like                            |
| GET     | `/properties`            | ✗    | Liste avec filtres + facets            |
| GET     | `/properties/:id`        | ✗    | Détail + biens similaires              |
| GET     | `/favorites`             | ✓    | Favoris de l'utilisateur               |
| POST    | `/favorites/:propertyId` | ✓    | Toggle favori                          |
| GET     | `/notifications`         | ✗    | Notifications de démo                  |

### Filtres `/properties`

`q`, `region`, `location`, `type`, `transaction` (`sale` / `rent`), `minPrice`,
`maxPrice`, `minRooms`, `minSurface`, `featured`, `sort` (`price-asc`,
`price-desc`, `surface-desc`, défaut : plus récent).

---

## 🏗️ Stack technique

| Couche      | Technologies                                                            |
| ----------- | ----------------------------------------------------------------------- |
| **Backend** | Node 18, Express 4, JWT (jsonwebtoken), bcryptjs, helmet, cors, morgan, express-rate-limit, dotenv |
| **Web**     | Next.js 14 (App Router), React 18, TailwindCSS 3, Framer Motion, lucide-react |
| **Mobile**  | Expo SDK 51, React Native 0.74, React Navigation 6, AsyncStorage, @expo/vector-icons |
| **Data**    | Store en mémoire (in-process) — remplaçable par PostgreSQL / Prisma sans changer l'API |

### Pourquoi pas Postgres dès la V1 ?

Pour une démo investisseur, un store en mémoire :

1. évite toute friction d'installation (zéro service externe),
2. permet de seeder en un fichier des données ultra-soignées,
3. présente exactement la même surface d'API qu'un vrai Postgres derrière,
4. se branche en V2 sur un Prisma + Postgres en 1 à 2 jours sans toucher au frontend.

---

## 🎨 Charte visuelle

- Couleurs : **brand-500** `#06b6d4` (cyan), **brand-700** `#0e7490` (deep teal), **ink-900** `#0f1626` (slate).
- Typographies : Inter (UI), Plus Jakarta Sans (display).
- Coins arrondis généreux (`rounded-2xl` / `rounded-3xl`), ombres douces.
- Motion : 200–400 ms, easing `easeOut`, animations d'apparition uniquement (pas de bling).

---

## 📐 Données mock soignées

- **6 propriétés** dont 3 demandées explicitement à Grand Baie (Penthouse, Maison 5 pièces, Maison 4 pièces), avec agents, photos pro, prestations détaillées, éligibilité PDS/IRS.
- **7 guides experts** (visa, logement, banque, santé, école, permis, fiscalité) avec étapes numérotées et tips.
- **5 posts communauté** réalistes, en français, avec auteurs typés expat à Maurice.
- **3 notifications** de démo.

Tout est en `backend/src/data/store.js` — un fichier à éditer pour customiser la démo.

---

## 🧭 Roadmap V2

- PostgreSQL + Prisma (la surface d'API ne bouge pas)
- Upload réel d'images (Cloudinary ou S3)
- Recherche full-text (Postgres `tsvector` ou Meilisearch)
- Module messagerie directe (Socket.io)
- Carte interactive immobilier (Mapbox)
- Push notifications mobile (Expo Notifications)
- Tests E2E (Playwright) + tests unitaires (Vitest + Jest)
- CI/CD (GitHub Actions) + déploiement Vercel + Render

---

© 2026 OMEGA — Made for the Mauritius expat community.
