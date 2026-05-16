# ---------- OMEGA Mobile (Expo) Dockerfile ----------
# This image serves the Expo dev server.
#
# Default mode = "web" → renders the mobile app inside a browser
# at http://localhost:19006 — perfect for a one-click Docker demo.
#
# To target Expo Go on a real device instead, switch the CMD to
#   ["npx","expo","start","--lan"]
# AND set REACT_NATIVE_PACKAGER_HOSTNAME=<your LAN IP> in compose.

FROM node:20-alpine

WORKDIR /app

# node:20-alpine ships /bin/sh (BusyBox) — that's enough for `expo start --web`.
# No apk add needed (avoids Alpine CDN TLS issues behind some corporate networks
# and Docker Desktop NAT setups).

ENV CI=1
ENV EXPO_NO_TELEMETRY=1
# Skip optional native deps that bring no value for the web demo
ENV npm_config_fund=false
ENV npm_config_audit=false

COPY package.json package-lock.json* ./
# --legacy-peer-deps because Expo's peer ranges are loose; matches what
# `expo install` would do.
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Expose all the ports Expo CLI may use
EXPOSE 8081 19000 19001 19002 19006

# Default: serve the app for the browser (works out-of-the-box on Docker Desktop)
CMD ["npx", "--yes", "expo", "start", "--web", "--port", "19006"]
