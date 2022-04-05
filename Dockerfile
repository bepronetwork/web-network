FROM node:16.10 AS builder

WORKDIR /app
RUN apt-get update 
COPY package*.json ./
RUN mkdir scripts
RUN npm --silent install --no-audit
COPY . .
RUN npm run build

FROM node:16.10-alpine AS release

WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install --only=production --silent --no-audit
COPY --from=builder /app/.next .next
COPY --from=builder /app/dist dist
CMD npm run start
