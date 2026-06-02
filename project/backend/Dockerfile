FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY . .
# No secrets or node_modules from host — only copied source

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY firebase ./firebase
EXPOSE 3000
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
