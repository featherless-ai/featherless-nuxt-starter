#!/usr/bin/env sh
set -eu

# Port precedence: platform-declared SANDBOX_SERVICE_PORT > local PORT > 3000.
PORT="${SANDBOX_SERVICE_PORT:-${PORT:-3000}}"
export NITRO_PORT="$PORT"
export HOST="0.0.0.0"

# Bridge Featherless platform env vars into Nuxt's runtime-override convention.
# Nuxt's `nuxt.config.ts` runtimeConfig values are evaluated at BUILD time —
# `process.env.FEATHERLESS_API_KEY` is undefined during `bun run build` inside
# the Docker image, so the bundled config has empty strings. At runtime, Nuxt
# only re-overrides keys whose env vars are prefixed `NUXT_`. Map the platform's
# canonical FEATHERLESS_* names to NUXT_FEATHERLESS_* so useRuntimeConfig() sees
# the values the sandbox-svc injected via app.yaml envTemplate.
[ -n "${FEATHERLESS_API_KEY:-}" ] && export NUXT_FEATHERLESS_API_KEY="$FEATHERLESS_API_KEY"
[ -n "${FEATHERLESS_API_BASE_URL:-}" ] && export NUXT_FEATHERLESS_API_BASE_URL="$FEATHERLESS_API_BASE_URL"
[ -n "${FEATHERLESS_MODEL:-}" ] && export NUXT_FEATHERLESS_MODEL="$FEATHERLESS_MODEL"
# Public model name (visible to the browser) — see runtimeConfig.public in nuxt.config.ts.
[ -n "${FEATHERLESS_MODEL:-}" ] && export NUXT_PUBLIC_DEFAULT_MODEL="$FEATHERLESS_MODEL"

echo "starting featherless-nuxt-starter on :$PORT"
exec bun run .output/server/index.mjs
