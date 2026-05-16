# OMEGA Frontend

Next.js 14 (App Router) + Tailwind. Premium SaaS-style UI for the OMEGA expat platform.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

> If the backend isn't running, the frontend falls back to mock data automatically so you can still demo the whole UI.

## Folders

- `app/` — Next.js App Router pages
  - `(auth)` — login / signup split-screen layout
  - `(app)` — authenticated app shell with sidebar + topbar
- `components/`
  - `ui/` — primitives (Button, Badge, Card, Logo, Skeleton)
  - `layout/` — Sidebar, Topbar, MobileNav
  - `feature/` — domain components (PropertyCard, GuideCard, PostCard, PostComposer, HeroBanner)
- `lib/` — api client, auth context, i18n (FR/EN), utils, mock fallback
