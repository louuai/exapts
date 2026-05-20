FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
# Prisma needs OpenSSL on alpine
RUN apk add --no-cache openssl

# Install all deps (Prisma CLI is in devDependencies but needed for `migrate deploy`)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source + prisma schema
COPY src    ./src
COPY prisma ./prisma

# Generate the Prisma client at build time
RUN npx prisma generate

USER node

EXPOSE 4000

HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=10 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Default command syncs the schema (db push — idempotent, no migration files
# needed), runs the seed (idempotent upserts), then starts the API.
# For the worker service we override CMD to "node src/worker.js" in compose.
CMD ["sh","-c","npx prisma db push --skip-generate --accept-data-loss && node prisma/seed.js && node src/server.js"]
