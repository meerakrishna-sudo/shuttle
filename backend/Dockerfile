# Multi-stage build — stage 1 installs deps, stage 2 is the final lean image
# This keeps the production image smaller (no devDependencies)

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app

# Run as non-root for security (principle of least privilege)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER appuser

EXPOSE 5000

# Health check so Docker/Cloud Run knows when the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
