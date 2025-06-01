#!/bin/sh
# docker-entrypoint.sh
set -eu

# ──────────────────────────────────────────────────────────
# Resolve the task’s own IP and publish it as GraphQL origin
# ──────────────────────────────────────────────────────────
SELF_IP="$(hostname -i | awk '{print $1}')"
export INTERNAL_GRAPHQL_URL="http://$SELF_IP:3000/api/graphql"
echo "⇢ INTERNAL_GRAPHQL_URL=$INTERNAL_GRAPHQL_URL"

# ──────────────────────────────────────────────────────────
# Run migrations (ignore “already applied” noise in prod)
# ──────────────────────────────────────────────────────────
npx prisma migrate deploy --schema=./prisma/schema.prisma || true

# ──────────────────────────────────────────────────────────
# Hand-off to Next.js.  We listen on the task ENI, *not* 127.0.0.1
# ──────────────────────────────────────────────────────────
exec node server.js --hostname "$SELF_IP" --port 3000
