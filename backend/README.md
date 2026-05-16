# OMEGA Backend

Node.js / Express REST API. JWT auth, in-memory store, ready to swap for Postgres + Prisma.

## Run

```bash
cp .env.example .env
npm install
npm run dev   # nodemon, port 4000
```

## Endpoints

See [/README.md](../README.md#-api-rest) in the repo root for the full table.

## Data

All seed data lives in [`src/data/store.js`](src/data/store.js). Tweak this file to customise the demo content (properties, guides, users, posts).
