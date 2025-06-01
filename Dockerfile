# syntax=docker/dockerfile:1

################################################################################
# ⬇⬇⬇  BUILD  STAGE  ⬇⬇⬇
################################################################################
FROM --platform=$BUILDPLATFORM node:20-slim AS build
WORKDIR /app

# ── public origin that the build needs to know -------------------------------
# (values are supplied with --build-arg SITE_URL=…)
ARG SITE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV SITE_URL=${SITE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# ── system deps (OpenSSL 3) ---------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# 1 ▸ install JS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 2 ▸ let prisma generate its client
COPY prisma ./prisma
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
RUN npx prisma generate

# 3 ▸ CSS optimiser (pure-JS, no native deps)
RUN npm install --no-save lightningcss

# 4 ▸ post-install hooks
RUN npm rebuild && npm run prepare --if-present || true

# 5 ▸ pull in the rest of the source & build
COPY . .
RUN npm run build



################################################################################
# ⬇⬇⬇  RUNTIME  STAGE  ⬇⬇⬇
################################################################################
FROM node:20-slim AS runtime
WORKDIR /app

# ── minimal system deps -------------------------------------------------------
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl tini \
 && rm -rf /var/lib/apt/lists/*

# ── runtime env ───────────────────────────────────────────────────────────────
ARG SITE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    SITE_URL=${SITE_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# ── add sharp so next/image works in standalone containers --------------------
RUN npm install --no-save sharp

# ── copy the standalone bundle & assets --------------------------------------
COPY --from=build /app/.next/standalone         ./
COPY --from=build /app/.next/static             ./.next/static
COPY --from=build /app/public                   ./public

# ── copy everything Prisma needs --------------------------------------------
COPY --from=build /app/node_modules/@prisma     ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma     ./node_modules/.prisma
COPY --from=build /app/prisma                   ./prisma
COPY --from=build /app/node_modules/prisma      ./node_modules/prisma
COPY --from=build /app/node_modules/.bin        ./node_modules/.bin

# ── ⛔  get rid of any .env files bundled by `next build` ----------------------
RUN rm -f .env .env.* || true

# ── network & entrypoint ------------------------------------------------------
# ── add the entry script & make it executable ---------------------------------
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# ── network & entrypoint ------------------------------------------------------
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini","--","/app/docker-entrypoint.sh"]