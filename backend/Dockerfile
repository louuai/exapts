FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies (better caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source
COPY src ./src

# Run as the unprivileged node user
USER node

EXPOSE 4000

# Healthcheck so docker-compose can wait on backend readiness
HEALTHCHECK --interval=20s --timeout=4s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
