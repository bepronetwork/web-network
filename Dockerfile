FROM node:16.14 AS builder

WORKDIR /app
RUN apt-get update 
COPY package*.json ./
RUN mkdir scripts
ENV CI=true
RUN npm --silent install --no-audit
COPY . .
RUN npm run build

FROM node:16.14-alpine AS release

WORKDIR /app
COPY package*.json ./
COPY . .
ENV CI=true
RUN npm --silent install --no-audit
COPY --from=builder /app/.next .next
CMD npm run start
