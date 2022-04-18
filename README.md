<!-- Using h2 instead of h1 because npm doesn't support align=center on h1 tags -->
<h2 align="center">
  <a href="#readme" title="WebApp README.md"><img alt="WebApp Logo" src="https://bafybeigznseyukyehtkphkckbaebjixypvpesd7xkmyx2ryzlsjdexelyy.ipfs.infura-ipfs.io/" alt="WebApp Logo" width="160"/></a>
</h2>

<h3 align="center">
  A tool to attach in Git Protocol Centralized SDKs to create incentives for developers to decentralize development in a liquid manner and with scale.
</h3>

<p align="center">
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#community">Community</a> •
  <a href="#docker">Docker</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#related">Related</a>
</p>

---

## 1. Prerequisites

- [NodeJS](https://nodejs.dev/) in v16.13 or more recent.
- [Docker](https://docs.docker.com/desktop/#download-and-install) or [PostgresSQL](https://www.postgresql.org/download/) in version 13.
- [Metamask](https://metamask.io/download/)
- [Github OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Github Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## 2. Getting Started

Install project dependencies:

```bash
$ npm install
```

Create database:

```bash
$ docker-compose up -d
```

Run migrations:

```bash
$ npm run migrate
```
<br>

## 3. Environment Configuration

Before start the project, you need set required keys and var in enviroment.

First copy or create a file _.env_ from the file _.env.exemple_
```console
$ cp .env.exemple .env
```

*`* You need follow all the required steps to the project run correctly.`*

- [MetaMask Setup](./docs/METAMASK.md) `*`
- [Authentication Setup](./docs/AUTHENTICATION.md) `*`
- [Github Gateway](./docs/GITHUB-GATEWAY.md) `*`
- [IPFS/Infura Host](./docs/IPFS.md) `*`
- [Ganache]()
- [IP-Api]()
- [Twitter Gateway]()
## Running

## Container

## Deploy
## Contributing

See [CONTRIBUTING.md](https://github.com/bepro/webapp/CONTRIBUTING.md) for our guide to contributing to web-network.

## Join in us Community

- [Discord](https://discord.gg/9aUufhzhfm)
- [Telegram](https://t.me/betprotocol)

<br/>

