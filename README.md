<h2 align="center">
  <a href="#readme" title="WebApp README.md"><img alt="WebApp Logo" src="https://bafybeigznseyukyehtkphkckbaebjixypvpesd7xkmyx2ryzlsjdexelyy.ipfs.infura-ipfs.io/" alt="WebApp Logo" width="160"/></a>
</h2>

<h3 align="center">
  A tool to attach in Git Protocol Centralized SDKs to create incentives for developers to decentralize development in a liquid and scalable manner. learn more <a href="https://bepronetwork.medium.com/what-is-bepro-network-6ec4054d2020">about</a>.
</h3>

<p align="center">
  <a href="#2-getting-started">Getting Started</a> •
  <a href="#3-environment-configuration">Enviroment</a> •
  <a href="#4-running">Running</a> •
  <a href="#5-contributing">Contributing</a> •
  <a href="#6-join-the-community">Community</a>
</p>

---

<h3 align="center">
  We are delighted to announce the release of <a href="https://app.bepro.network/">Bepro Network's v2 </a> protocol. Try it.
</h3>

# Documentation

## 1. Prerequisites

- [NodeJS](https://nodejs.dev/) in v16.13 or newer.
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

Create a new .env file based on the default example.

```console
$ cp .env.exemple .env
```

*`* These steps are mandatory`*

- `*` [MetaMask Setup](./docs/METAMASK.md)
- `*` [Authentication Setup](./docs/AUTHENTICATION.md)
- `*` [Github Gateway](./docs/GITHUB-GATEWAY.md)
- `*` [Past Events MicroService](https://github.com/taikai/webnetwork-events)
- `*` [IPFS/Infura Host](./docs/IPFS.md)
- [Ganache](./docs/GANACHE.md)

<br>

## 4. Running

After having completed the [Environment Configuration](#3-environment-configuration) step, the project is ready to be started.

start project with:

```bash
$ npm run dev
```
<br>

### Connecting Github and Metamask.

with the project running, browse to the project url, and connect the wallet.
<br/>

><img align="center" src="./docs/assets/connecting-metamask.png" width="500"/>

<br>

Next, connect with github.
<br/>

><img align="center" src="./docs/assets/connecting-account.png" width="500"/>

<br>

if no errors are shown, you should see this page
<br/>

><img align="center" src="./docs/assets/connected-account.png" width="500"/>

<br>

<br>

### Network Configuration

The last step to configure the network is complete. learn more [link](./docs/NETWORK-MANAGER.md).


<br/>

><img align="center" src="./docs/assets/network-settings-page.png" width="500"/>

<br>

## 5. Contributing

See [CONTRIBUTING.md](https://github.com/bepro/webapp/CONTRIBUTING.md) for our guide to contributing to web-network.

<br>

## 6. Join the community

- [Discord](https://discord.gg/9aUufhzhfm)
- [Telegram](https://t.me/betprotocol)
- [Medium](https://bepronetwork.medium.com)
- [WebSite](https://www.bepro.network)

<br/>

