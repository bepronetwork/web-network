## 1. GANACHE

Ganache is a personal blockchain for rapid Ethereum and Corda distributed application development. Ganache can be used for the entire development cycle. enabling you to develop, deploy, and test your dApps in a safe and deterministic environment.

read more about in [doc](https://trufflesuite.com/docs/ganache/).

<br/>

## 2. CONFIGURING GANACHE WORKSPACE.

1. After installing ganache, create a new ethereum workspace
> <img align="center" src="./assets/ganache-create-workspace.png" width="500"/>
<br/>

2. On the server tab, change the network id to `1337`
> <img align="center" src="./assets/ganache-server.png" width="500"/>
<br/>

3. On Ganache Home, chose one wallet and copy the private key

> <img align="center" src="./assets/ganache-home.png" width="500"/>
<br/>

> <img align="center" src="./assets/ganache-wallet-privatekey.png" width="500"/>
<br/>

1. Go to Meta Mask, click in `Import Wallet` and put the Private Key.

> <img align="center" src="./assets/metamask-import-wallet.png" width="500"/>
<br/>

> <img align="center" src="./assets/metamask-add-wallet.png" width="500"/>
<br/>

5. On metamask yet, click to add network, and complete with ganache info.

> <img align="center" src="./assets/metamask-btn-add.png" width="500"/>
<br/>

> <img align="center" src="./assets/metamask-add-network.png" width="500"/>
<br/>

<br/>

## 3. DEPLOY NEW CONTRACT IN GANACHE.

1. Update the .env file with the wallet private key and address

```text
# .env

#Deploy Contract
DEPLOY_OWNER_ADDRESS=
DEPLOY_PRIVATE_KEY=
```

2. Make sure your database are up, and run:

```bash
$ npm run deploy:local
```

### 3.1 USE A DEPLOYED CONTRACT
If you want to use a deployed contract, you must update the env file with current address **before** run migrations.

```text
# .env

NEXT_PUBLIC_CONTRACT_ADDRESS=NetworkContractAddress
NEXT_PUBLIC_SETTLER_ADDRESS=BeproContractAddress
NEXT_PUBLIC_TRANSACTION_ADDRESS=BeproContractAddress
NEXT_PUBLIC_NETWORK_FACTORY_ADDRESS=NetworkFactoryAddress
```