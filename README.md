# Web-network

## Steps to running locally

### Start postgresdb on docker

First time
```bash
docker run -d --name github-db -p 54320:5432 -e POSTGRES_PASSWORD=github -e POSTGRES_DB=github -e POSTGRES_USER=github postgres:13
```
After that
```bash
docker start github-db
```

### Execute Sequelize migrations

```bash
npm run migrate
```

### And start the development server

```bash
npm run dev
```