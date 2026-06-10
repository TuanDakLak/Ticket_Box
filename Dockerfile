FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runtime  
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/apps/backend-api/dist ./apps/backend-api/dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node apps/backend-api/dist/main.js"]