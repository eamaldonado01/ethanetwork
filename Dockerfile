# syntax=docker/dockerfile:1

############ BUILD STAGE ############
FROM --platform=$BUILDPLATFORM node:20-slim AS build
WORKDIR /app

# make sure OpenSSL 3 is present in build stage too
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# 1. Pull in deps manifest and install
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 2. Copy Prisma schema so `prisma generate` can see it
COPY prisma ./prisma

# Prevent Prisma from trying to auto-install other engines
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
RUN npx prisma generate

# 3. LightningCSS (pure-JS, cross-platform)
RUN npm install --no-save lightningcss

# 4. post-install hooks
RUN npm rebuild && npm run prepare --if-present || true

# 5. Bring in your application code & build
COPY . .
RUN npm run build

############ RUNTIME STAGE ############
FROM node:20-slim AS runtime
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# Next.js standalone output + assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static   ./.next/static
COPY --from=build /app/public          ./public

# Prisma client & schema (for runtime)
COPY --from=build /app/prisma          ./prisma
COPY --from=build /app/node_modules/.prisma    ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma    ./node_modules/@prisma

# GraphQL schema if you need it
COPY --from=build /app/src/graphql      ./src/graphql

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node","server.js"]
