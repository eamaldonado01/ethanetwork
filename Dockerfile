# syntax=docker/dockerfile:1

############ BUILD STAGE ############
FROM --platform=$BUILDPLATFORM node:20-slim AS build
WORKDIR /app

# 1. deps (skip scripts first)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 2. correct LightningCSS binary
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      npm install --no-save lightningcss-linux-arm64-gnu ; \
    else \
      npm install --no-save lightningcss-linux-x64-gnu ; \
    fi

# 3. run post-install hooks
RUN npm rebuild && npm run prepare --if-present || true

# 4. Prisma generate
COPY prisma ./prisma
RUN npx prisma generate

# 5. copy src & build
COPY . .
RUN npm run build

############ RUNTIME STAGE ############
FROM node:20-slim AS runtime
WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public      ./public
COPY --from=build /app/prisma      ./prisma   

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node","server.js"]
