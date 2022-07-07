FROM node:16.14 AS builder

WORKDIR /app
RUN apt-get update 
COPY ${BUILD_ENV_FILE} .build.env
COPY package*.json ./
RUN mkdir scripts
ENV CI=true
RUN npm --silent install --no-audit
COPY . .
RUN export $(cat .build.env | xargs) &&  npm run build
FROM node:16.14 AS release

WORKDIR /app
COPY package*.json ./
COPY . .
ENV CI=true
RUN npm install --only=production --no-audit
COPY --from=builder /app/.next .next
EXPOSE 3000
CMD npm run start
