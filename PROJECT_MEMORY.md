# OMEGA — Project Memory

> Mémoire complète du projet OMEGA, plateforme pour expatriés à l'île Maurice.
> Conçu comme un V1 démontrable à des investisseurs, mais structuré pour scaler vers un vrai SaaS.

---

## 📌 TL;DR

**Produit :** une plateforme web + mobile pour expatriés à Maurice, avec 4 modules :

1. **Immobilier premium** (priorité business #1, lead-generation)
2. **Communauté** (réseau social style Instagram/Facebook)
3. **Guides** (visa, banque, école, fiscalité…)
4. **Annuaire de services** (notaires, agences, avocats…)

**Stack :**
- **Frontend web** : Next.js 14 (App Router) + React 18 + TailwindCSS + Framer Motion
- **Backend API** : Node.js 20 + Express 4 + JWT + bcrypt + helmet + rate-limit
- **Mobile** : React Native (Expo SDK 51) + React Navigation
- **Persistence** : in-memory (un seul fichier `store.js`), prêt à migrer vers Postgres
- **Orchestration** : Docker Compose 3 services (backend, frontend, mobile)

**Comptes démo :**
- User : `demo@omega.mu` / `demo1234`
- Admin : `admin@omega.mu` / `admin1234`

**Lancement :**
```bash
docker compose up --build
```
→ web `:3000`, API `:4000`, mobile web `:19006`

---

## 🗺 Carte du projet (file tree de référence)

```
expats/
├── backend/                       # API Node.js/Express
│   ├── Dockerfile                 # Node 20-alpine, healthcheck
│   ├── .dockerignore
│   ├── package.json
│   └── src/
│       ├── server.js              # Wire up Express + middlewares + routes
│       ├── data/store.js          # ⭐ Source of truth in-memory
│       ├── middleware/auth.js     # requireAuth, requireAdmin, signToken
│       └── routes/
│           ├── auth.js            # signup/login/me + PATCH /me + change-password
│           ├── guides.js          # GET guides, GET guide:slug
│           ├── posts.js           # CRUD posts (with edit/delete own)
│           ├── properties.js      # GET/POST/PUT/DELETE properties (admin CRUD)
│           ├── favorites.js       # User favorites
│           ├── notifications.js   # Mock notifications
│           ├── leads.js           # Public POST, admin GET/PATCH/DELETE
│           ├── visits.js          # Visit requests (user + admin)
│           ├── messages.js        # Property inquiries
│           ├── services.js        # Directory CRUD (admin write, public read)
│           ├── admin.js           # /admin/stats, /admin/users
│           └── users.js           # Public user profile + their posts
│
├── frontend/                      # Next.js web app
│   ├── Dockerfile                 # Multi-stage build
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── app/
│   │   ├── layout.jsx             # Root layout (providers)
│   │   ├── page.jsx               # ⭐ Landing page
│   │   ├── globals.css
│   │   ├── (auth)/                # Login + Signup with split-screen layout
│   │   ├── (app)/                 # Authenticated app
│   │   │   ├── layout.jsx         # Sidebar + Topbar + MobileNav
│   │   │   ├── dashboard/         # Home (hero + featured)
│   │   │   ├── properties/        # List with Achat/Location tabs + detail
│   │   │   ├── guides/            # List + detail (Notion-like)
│   │   │   ├── community/         # Social feed
│   │   │   ├── services/          # Annuaire dynamique
│   │   │   ├── favorites/
│   │   │   ├── users/[id]/        # Public user profile (Instagram-like)
│   │   │   └── profile/           # Personal dashboard (6 tabs)
│   │   └── admin/                 # Admin panel (role-gated)
│   │       ├── layout.jsx         # AdminGuard + dark sidebar/topbar
│   │       ├── page.jsx           # Overview KPIs
│   │       ├── properties/        # CRUD biens
│   │       ├── services/          # CRUD annuaire
│   │       ├── leads/             # Manage leads + CSV export
│   │       ├── visits/            # Manage visit requests
│   │       ├── messages/          # Manage messages
│   │       └── users/             # User list (read-only)
│   ├── components/
│   │   ├── ui/                    # Button, Badge, Card, Logo, Modal, Skeleton
│   │   ├── layout/                # Sidebar, Topbar, MobileNav
│   │   ├── feature/               # Domain components (cards, modals)
│   │   ├── marketing/             # MarketingNav, MarketingFooter
│   │   │   └── sections/          # 9 landing sections
│   │   └── admin/                 # AdminGuard, AdminSidebar, DataTable, …
│   └── lib/
│       ├── api.js                 # Single fetch client for every endpoint
│       ├── auth.js                # AuthProvider + useAuth + isAdmin
│       ├── i18n.js                # FR/EN dictionaries + Provider
│       ├── utils.js               # cn, formatPrice, timeAgo, formatDate
│       └── mock-fallback.js       # Static fallback when backend is down
│
├── mobile/                        # Expo (React Native)
│   ├── Dockerfile                 # Expo web mode by default
│   ├── app.json                   # web bundler enabled
│   ├── App.js                     # NavigationContainer + tabs
│   └── src/
│       ├── lib/                   # api, auth, theme
│       ├── data/mockProperties.js # Offline fallback
│       ├── components/            # PropertyCard, ScreenHeader
│       └── screens/               # 6 screens (Home, Properties, Detail, Guides, Community, Login)
│
├── docker-compose.yml             # backend + frontend + mobile (web mode)
├── docker-compose.mobile-lan.yml  # Override for Expo Go on real phone
├── README.md                      # Setup + endpoints + stack
└── PROJECT_MEMORY.md              # ⭐ This file
```

---

## 🧭 Chronologie détaillée — ce qu'on a fait

### Phase 1 — Scaffolding (V1 MVP)

**Demande initiale :** "OMEGA, plateforme expatriés à Maurice. 3 modules (guides, communauté, immobilier). Stack Next.js + Tailwind + Node.js + Postgres. UI premium, démo investisseur."

**Décisions clés prises :**
- Stack complète : Next.js front + Express back + Expo mobile, comme demandé.
- Bilingue **FR/EN** avec toggle persistant (`localStorage.omega.locale`).
- Local-only pour la démo (pas de Vercel/cloud).
- **In-memory store** au lieu de Postgres — surface API identique, zéro friction de setup.
- Charte : Inter + Plus Jakarta Sans, palette `brand` (cyan #06b6d4) + `ink` (slate #0f1626), `rounded-2xl` partout, ombres douces, Framer Motion sur scroll-in.

**Livré :**
- 6 biens immobiliers initiaux (Penthouse Grand Baie + Maisons 5p/4p Grand Baie + Villa Tamarin…)
- 7 guides (Visa Premium, Logement, Banque MCB/SBM, Santé, École, Permis, Fiscalité 15%)
- 5 posts communauté seed (Claire, Marc, Sophie, Léo, Amélie)
- Auth JWT signup/login/me, favoris, notifications mock
- Mobile Expo : Home, Properties list, Property detail, Login

### Phase 2 — Docker

- 3 Dockerfiles + `docker-compose.yml`
- Backend : Node 20-alpine, `npm install --omit=dev`, USER node, healthcheck `/api/health`
- Frontend : multi-stage (deps → builder → runner), `NEXT_PUBLIC_API_URL` injecté au build
- Mobile : Expo en mode `--web --port 19006` par défaut (un seul `docker compose up` et c'est démontable au navigateur)
- Override `docker-compose.mobile-lan.yml` pour Expo Go sur téléphone physique (avec `HOST_LAN_IP`)
- Compose : `depends_on.backend.condition: service_healthy` → pas de race au boot

### Phase 3 — Catalogue immobilier Decordier

**Demande :** remplacer le catalogue par les 13 références réelles d'`decordier-immobilier.mu` + ajouter une section location.

**Livré :**
- 13 biens **achat** mappés sur les URLs Decordier (Grand Baie, Beau Champ, Pointe aux Canonniers, Pereybère, Balaclava, Rivière Noire), avec prix indicatifs marché 2026 et descriptions originales
- 5 biens **location** longue durée (Grand Baie, Tamarin, Pereybère, Flic-en-Flac, Moka)
- Onglets **Achat / Location** prominents sur la page `/properties`
- Badge référence `MA7-xxxx` visible sur chaque carte
- ⚠️ Images Unsplash + descriptions originales pour rester clean côté copyright (pas de scraping des vraies photos)

### Phase 4 — Landing page (conversion-focused)

**Sections finales de `/` :**

1. **HeroSection** — "Trouvez votre maison à Maurice avant même votre arrivée" + stat **+400 biens disponibles** + 2 CTAs (Voir les biens / Recevoir les offres exclusives → ouvre modal lead) + mockup navigateur HTML "live" avec mini-listings
2. **ProblemSection** — 3 problèmes (logement, réseau, info)
3. **SolutionSection** — 4 modules (Guides, Communauté, Services, Immobilier)
4. **RealEstateSection** — 4 biens featured avec badges "Expat Opportunity" + boutons Contact / Visite
5. **WhyMauritiusSection** — 4 cards (Fiscalité 15%, ROI 5-8%, Lifestyle, Residence Permit)
6. **LeadCaptureSection** — formulaire inline avec photo de penthouse + CTA "Recevoir les opportunités exclusives"
7. **HowItWorksSection** — 3 étapes
8. **TestimonialsSection** — 4 témoignages + bandeau stats (4.9/5, 12K expats, 480 biens, 18j Permit)
9. **FinalCTASection** — banner gradient avec 2 CTAs

**MarketingNav** : sticky transparente, devient glassmorphism au scroll, bouton "Offres exclusives" (cyan light) + "Essayer la démo" (dark), toggle langue, menu hamburger mobile.

**MarketingFooter** : 6 colonnes sombres (Logo + tagline + socials + 4 cols liens).

### Phase 5 — Profile dashboard utilisateur

**Route :** `/profile?tab=…`

**6 onglets** (suspense-wrapped pour `useSearchParams`) :
1. **Mon compte** — édition nom/téléphone/bio/localisation/avatar (upload local base64)
2. **Mes posts** — `PostComposer` intégré + liste des posts avec edit/delete
3. **Favoris** — biens sauvegardés
4. **Visites** — demandes de visite avec status badges
5. **Messages** — inquiries envoyées
6. **Paramètres** — changement mot de passe + toggles préférences notifications

### Phase 6 — Admin panel (route `/admin`)

**`AdminGuard`** redirige les non-admins vers `/dashboard` (et les non-loggés vers `/login?next=/admin`).

**Layout sombre dédié** : `AdminSidebar` (ink-950), `AdminTopbar`, `AdminMobileNav`.

**Pages :**
- **Overview** — 6 KPIs (Users, Properties, Services, Leads, Visits, Messages) + feed d'activité (10 derniers events)
- **Properties** — table + modal full CRUD (upload multi-images base64, tags chip-input, features, transaction toggle, region/type, featured)
- **Services** — table + modal CRUD (catégorie, subscription standard/premium, upload image)
- **Leads** — table avec filtre + status select (new/contacted/closed) + **export CSV** + suppression
- **Visits** — table avec status select (pending/confirmed/done/cancelled)
- **Messages** — table avec status select (open/answered/closed)
- **Users** — table read-only (avatar, role badge admin/user)

**Tous les contenus business sont gérables ici** (zéro hardcode côté frontend).

### Phase 7 — Easter egg admin door

**Sur la landing, 5 clics rapides sur le logo OMEGA → modal de connexion admin.**

- Implémentation dans `components/ui/Logo.jsx` (compteur + setTimeout reset 2s)
- `components/feature/SecretAdminLoginModal.jsx` — login dédié, si déjà admin → redirect direct
- Si non-admin se connecte → message "Ce compte n'a pas les droits administrateur"

**Bug critique trouvé et fixé** dans cette phase : le Modal se rendait à l'intérieur du `<Link>` parent. Un click sur "submit" bubble jusqu'au Link, qui call `e.preventDefault()`. Or, **un click `preventDefault`é sur un `<button type="submit">` bloque l'événement submit**. Solution : portal React vers `document.body` + `stopPropagation` exhaustif (`onClick`, `onMouseDown`, `onMouseUp`) + `window.location.assign` pour la nav finale (évite la race condition router.push / animation exit du modal).

### Phase 8 — Social features (Instagram-like)

**Backend :**
- `PATCH /api/posts/:id` — éditer son post (admin override)
- `DELETE /api/posts/:id` — supprimer son post
- Champ `editedAt` ajouté à chaque édition
- `GET /api/users/:id` — profil public + fallback sur les auteurs seed (Claire/Marc/Sophie n'ont pas de compte mais ont quand même une page)
- `GET /api/users/:id/posts` — feed d'un utilisateur
- `GET /api/posts?userId=…` — filtre par auteur

**Frontend :**
- **PostComposer** : upload local depuis device (file picker + base64), **drag & drop**, ou URL classique. Preview avec ✕, max 4 Mo
- **PostCard** : menu kebab "⋯" sur ses propres posts (Modifier / Supprimer), `EditPostModal` réutilisable, mention "modifié", avatars/noms cliquables vers profil
- **Page `/users/[id]`** : bannière gradient avec stats (publications / J'aime reçus / Statut), feed complet de l'utilisateur, badge Admin/Vérifié
- Lien "Voir mon profil public" dans `/profile`
- Sidebar communauté avec **membres actifs cliquables**

### Phase 9 — Petite amélioration annuaire

- **Bandeau Premium showcase** en haut de `/services` (gradient sombre OMEGA, les 4 services premium en card hover)
- Bouton **"Demander un devis"** sur chaque carte
- `ServiceQuoteModal` crée un lead avec `interest: "service:<id>"` → atterrit dans `/admin/leads`, filtrable

---

## 🏗 Architecture & décisions

### Pourquoi in-memory au lieu de Postgres dès la V1 ?

1. Zéro friction d'installation pour une démo investisseur.
2. Données seed ultra-soignées dans un seul fichier (`store.js`) — éditable en 30 secondes pour customiser.
3. **Même surface d'API** qu'avec Postgres — migration Prisma + PG = 1 à 2 jours sans toucher au frontend.
4. Idéal pour itérer vite en phase MVP.

### Pourquoi un monorepo plat (pas Nx/Turborepo) ?

- 3 apps complètement indépendantes (backend / frontend / mobile)
- Communication via HTTP uniquement, aucun couplage in-process
- Chaque app a son propre `package.json`, son propre `Dockerfile`
- Simple à reprendre pour un dev qui découvre le projet

### Pourquoi Framer Motion plutôt que CSS animations ?

- Scroll-triggered animations propres avec `whileInView` (one-shot)
- Modal entrance/exit cohérents
- API déclarative qui matche bien la grammaire React

### Pourquoi un `Modal` via portail React ?

Découvert à la dure (Easter egg admin) : sans portail, un Modal rendu dans un `<Link>` parent capture le click sur ses inputs/buttons et casse silencieusement les `<button type="submit">`. Le portal + `stopPropagation` règle le problème une fois pour toutes.

### Pourquoi `EXPO_PUBLIC_API_URL` ?

Expo SDK 49+ inline ces variables au build. Permet à Docker Compose d'injecter l'IP LAN du host (`docker-compose.mobile-lan.yml`) sans toucher au code mobile.

### Pourquoi des fallbacks mock côté frontend ?

`lib/mock-fallback.js` permet à toute la landing + dashboard de rester démontables même si le backend est down. Réduit l'anxiété d'une démo live.

---

## 🛣 Endpoints API complets

Base URL : `http://localhost:4000/api`

### Auth
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| POST | `/auth/signup` | — | Public |
| POST | `/auth/login` | — | Public |
| GET | `/auth/me` | ✓ | Self |
| PATCH | `/auth/me` | ✓ | Self |
| POST | `/auth/change-password` | ✓ | Self |

### Properties
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| GET | `/properties` | — | Public (filtres + facets) |
| GET | `/properties/:id` | — | Public (+ similar) |
| POST | `/properties` | ✓ | **Admin** |
| PUT | `/properties/:id` | ✓ | **Admin** |
| DELETE | `/properties/:id` | ✓ | **Admin** |

### Guides
| Méthode | Endpoint | Auth |
|---|---|---|
| GET | `/guides` | — |
| GET | `/guides/:slug` | — |

### Posts (social feed)
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| GET | `/posts?userId=` | opt | Public |
| POST | `/posts` | ✓ | User |
| PATCH | `/posts/:id` | ✓ | Owner / admin |
| DELETE | `/posts/:id` | ✓ | Owner / admin |
| POST | `/posts/:id/like` | ✓ | User |

### Users (profil public)
| Méthode | Endpoint | Auth |
|---|---|---|
| GET | `/users/:id` | — |
| GET | `/users/:id/posts` | — |

### Favorites
| Méthode | Endpoint | Auth |
|---|---|---|
| GET | `/favorites` | ✓ |
| POST | `/favorites/:propertyId` | ✓ |

### Leads (lead-gen landing)
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| POST | `/leads` | — | Public (capture) |
| GET | `/leads` | ✓ | Admin |
| PATCH | `/leads/:id` | ✓ | Admin |
| DELETE | `/leads/:id` | ✓ | Admin |

### Visits
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| POST | `/visits` | ✓ | User |
| GET | `/visits` | ✓ | Self / admin |
| PATCH | `/visits/:id` | ✓ | Admin |

### Messages (property inquiries)
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| POST | `/messages` | ✓ | User |
| GET | `/messages` | ✓ | Self / admin |
| PATCH | `/messages/:id` | ✓ | Admin |

### Services (annuaire)
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| GET | `/services` | — | Public (filtres) |
| GET | `/services/:id` | — | Public |
| POST | `/services` | ✓ | Admin |
| PUT | `/services/:id` | ✓ | Admin |
| DELETE | `/services/:id` | ✓ | Admin |

### Notifications
| Méthode | Endpoint | Auth |
|---|---|---|
| GET | `/notifications` | — |
| POST | `/notifications/:id/read` | — |

### Admin
| Méthode | Endpoint | Auth | Rôle |
|---|---|---|---|
| GET | `/admin/stats` | ✓ | Admin |
| GET | `/admin/users` | ✓ | Admin |

---

## 🗂 Data models (in `store.js`)

### User
```js
{ id, email, name, phone, avatar, bio, location,
  role: 'user' | 'admin',
  notificationPrefs: { newProperties, communityReplies, weeklyDigest },
  passwordHash, createdAt }
```

### Property
```js
{ id, reference, title, titleEn, type, transaction: 'sale' | 'rent',
  price, currency, location, region, coordinates,
  surface, landSurface, rooms, bedrooms, bathrooms, parking, yearBuilt,
  eligibility, images: [], description, descriptionEn,
  features: [], tags: [],     // ← tags inclut "Expat Opportunity" etc.
  agent: { name, agency, phone, avatar },
  listedAt, featured, new }
```

### Post
```js
{ id, user: { id, name, avatar, location },
  content, image, tag, likes, comments, likedBy,
  editedAt?, createdAt }
```

### Lead
```js
{ id, name, email, phone, message, source, interest,
  status: 'new' | 'contacted' | 'closed', createdAt }
```

### VisitRequest
```js
{ id, propertyId, userId, userName, userEmail, userPhone,
  preferredDate, message,
  status: 'pending' | 'confirmed' | 'done' | 'cancelled', createdAt }
```

### Message (property inquiry)
```js
{ id, propertyId, userId, userName, userEmail, body,
  status: 'open' | 'answered' | 'closed', createdAt }
```

### Service
```js
{ id, name, category, description, location, image,
  contact: { phone, email, website }, rating, reviews,
  subscription: 'standard' | 'premium', createdAt }
```

### Guide
```js
{ id, slug, title, titleEn, category, icon, color, coverImage,
  description, descriptionEn, readTime, updatedAt,
  steps: [{ title, body }], tips: [string] }
```

---

## 🎨 Design system

| Token | Value | Usage |
|---|---|---|
| `brand-500` | `#06b6d4` (cyan) | Boutons primaires, accents |
| `brand-700` | `#0e7490` (deep teal) | Hover, gradients |
| `ink-900` | `#0f1626` (slate noir) | Texte principal, dark CTAs |
| `ink-50` | `#f7f9fc` | Background app |
| Inter | UI font | Tout sauf headings |
| Plus Jakarta Sans | Display font | h1, h2, titles |
| `rounded-2xl` (1rem) | Border radius standard | Cards, inputs, buttons |
| `rounded-3xl` (1.5rem) | Border radius hero | Banners, modal, gallery |
| `shadow-soft` | `0 1px 2px / 0 4px 24px` | Cards au repos |
| `shadow-card` | `0 4px 32px` | Cards au hover |
| `shadow-glow` | `0 8px 40px brand-500/25` | Logo + CTA accent |

---

## 🐳 Docker

### Backend
- `node:20-alpine`, NODE_ENV=production, `npm install --omit=dev`
- USER non-root, healthcheck via `fetch('/api/health')`

### Frontend
- Multi-stage (deps → builder → runner)
- `ARG NEXT_PUBLIC_API_URL` injecté au build (variables `NEXT_PUBLIC_*` sont inlinées dans le bundle)

### Mobile
- Mode **Web** par défaut (port 19006) — démo navigateur zéro setup
- Override **LAN** (`docker-compose.mobile-lan.yml`) avec `HOST_LAN_IP` pour Expo Go sur smartphone

### Compose
- 3 services sur réseau `omega`
- Frontend attend que backend soit `healthy`
- `restart: unless-stopped`

---

## 🚀 Démarrage

```bash
# Option 1 — Docker (recommandé pour démo)
docker compose up --build
# → web :3000, API :4000, mobile web :19006

# Option 2 — Node natif
cd backend  && cp .env.example .env && npm i && npm run dev
cd frontend && cp .env.example .env.local && npm i && npm run dev
cd mobile   && npm i && npm start
```

---

## 🔓 Comptes démo

| Rôle | Email | Password | Accès |
|---|---|---|---|
| User | `demo@omega.mu` | `demo1234` | App, profil, favoris, posts |
| Admin | `admin@omega.mu` | `admin1234` | Tout ce qui précède + `/admin` |

**Astuce Easter egg :** sur la landing `/`, cliquer **5 fois rapidement** sur le logo OMEGA en haut à gauche → modal d'accès admin direct.

---

## 🌟 Features clés à mettre en avant en démo

1. **Landing conversion-focused** — Hero "Trouvez votre maison à Maurice avant d'arriver" + +400 biens + 2 CTAs + 9 sections scrollables → modal lead capture
2. **Tabs Achat/Location** sur `/properties`, avec filtres + tri + 13 biens vente + 5 location
3. **Détail propriété** avec galerie 4-up, key facts, agent panel sticky, boutons Contact + Demander visite
4. **Communauté style Instagram** — upload image local, edit/delete own posts, profils publics cliquables
5. **Profil personnel** 6 onglets avec posts + favoris + visites + messages + paramètres
6. **Annuaire** avec bandeau Premium + bouton "Demander un devis" → leads admin
7. **Admin panel complet** — KPIs, CRUD properties + services, gestion leads/visits/messages, export CSV
8. **Easter egg admin** — 5 clics sur logo
9. **Bilingue FR/EN** toggle persistant
10. **Mobile companion** Expo (web ou Expo Go)

---

## ⚠️ Limitations connues (à addresser en V2)

| Limitation | Impact | Solution V2 |
|---|---|---|
| Store en mémoire | Tout est perdu au restart du backend | Postgres + Prisma (1-2j de boulot) |
| Avatars/images en base64 dans store | OK pour démo, gros si on a 100+ biens | Cloudinary ou S3 + signed URLs |
| Pas de WebSocket | Notifs ne sont pas live | Socket.io ou SSE pour le feed communauté |
| Pas de tests | Risque de régression | Vitest (unit) + Playwright (E2E) |
| Pas de CI/CD | Deploy manuel | GitHub Actions + Vercel/Render |
| Mobile pas natif via Docker | Émulateurs lourds/lents | Garder le mode Expo Go sur tel physique |
| Pas de search full-text | Recherche par includes() seulement | tsvector Postgres ou Meilisearch |
| Pas de mailer | Les leads ne déclenchent pas d'email | Resend ou SendGrid |
| `helmet` agressif sur CSP | À surveiller en prod | Whitelist Unsplash, Dicebear |

---

## 🛣 Roadmap V2 (priorisée)

### Tier 1 — Production critical
1. PostgreSQL + Prisma (le contrat API ne change pas)
2. Cloudinary pour upload images (remplace base64)
3. Mailer transactionnel (Resend) — envoi auto sur capture lead + visit request
4. Tests E2E Playwright sur les parcours clés (lead, visit, admin login)
5. CI/CD GitHub Actions → Vercel (front) + Render (back)

### Tier 2 — Growth
6. Carte interactive immobilier (Mapbox/Maplibre)
7. Module messagerie directe in-app (Socket.io)
8. Push notifications mobile (Expo Notifications)
9. Recherche full-text Postgres
10. Système d'avis + ratings sur services (UGC)

### Tier 3 — Monetization
11. Stripe pour les "Premium subscription" des services (déjà modélisé : `subscription: 'premium'`)
12. Featured property listings payants (algo qui pousse les `featured: true` payés)
13. Conciergerie payante (Premium tier) — landing existe déjà, brancher checkout

---

## 📞 Contact dev

Tout ce code a été conçu pour qu'un autre dev (ou la future version de moi-même) puisse reprendre en quelques heures :

- **README.md** = setup + endpoints
- **PROJECT_MEMORY.md** = ce fichier, mémoire historique + design decisions
- **`backend/src/data/store.js`** = source of truth des données, éditable directement pour personnaliser la démo
- **`frontend/lib/i18n.js`** = toutes les chaînes UI au même endroit

© 2026 OMEGA — Made for the Mauritius expat community.
