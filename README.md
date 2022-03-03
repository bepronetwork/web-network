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

### Deploying new contracts and connect repos for local host development
- Change the `NEXT_PUBLIC_ADMIN_WALLET_ADDRESS` to contain yours
- issue `$ npm run dev`
- hop on `localhost:3000/parity`

