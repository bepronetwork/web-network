FROM node:16.16 AS builder

WORKDIR /app
RUN apt-get update 
COPY package*.json ./
RUN mkdir scripts
RUN npm install --no-audit
COPY . .
RUN npm run build

FROM node:16.16-alpine AS release

WORKDIR /app
COPY . .
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD npm run migrate
ENV NODE_OPTIONS="--require=elastic-apm-node/start-next.js"
CMD npm run start
