## 1. GANACHE

Ganache is a personal blockchain for rapid Ethereum and Corda distributed application development. Ganache can be used for the entire development cycle. enabling you to develop, deploy, and test your dApps in a safe and deterministic environment.

Read more about in [doc](https://trufflesuite.com/docs/ganache).

## 2. CONFIGURING GANACHE WORKSPACE.

Complete the Ganache [Quick Start](https://trufflesuite.com/docs/ganache/quickstart) before move on.

### 2.1 STARTING GANACHE

1. After installed ganache, create a new ethereum workspace.

> <img align="center" src="./assets/ganache-create-workspace.png" width="500"/>
<br/>

2. On the server tab, change the port number to `8545`. <br>*this step is important to run the deploy script successfully.*

> <img align="center" src="./assets/ganache-server.png" width="500"/>
<br/>

3. On Ganache Home, chose one wallet and copy the private key.

> <img align="center" src="./assets/ganache-home.png" width="500"/>
<br/>

> <img align="center" src="./assets/ganache-wallet-privatekey.png" width="500"/>
<br/>

### 2.2 IMPORT ACCOUNT AND NETWORK TO METAMASK

1. Go to Metamask, click on `Import account` and fill in the Private Key.

> <img align="center" src="./assets/metamask-import-wallet.png" width="500"/>
<br/>

> <img align="center" src="./assets/metamask-add-wallet.png" width="500"/>
<br/>

2. Then click on `Add network` and fill in with ganache info.

> <img align="center" src="./assets/metamask-btn-add.png" width="500"/>
<br/>

> <img align="center" src="./assets/metamask-add-network.png" width="500"/>
<br/>

## 3. UPDATE ENV FILE.

Don't forget update you .ENV file with ganache info.

```text
# .env

# Create a new infura provider (or anyother web3 provider) and add the id here
NEXT_PUBLIC_WEB3_CONNECTION=HTTP://localhost:8545

# MetaMask Network Configs
NEXT_PUBLIC_NATIVE_TOKEN_NAME=ETH
NEXT_PUBLIC_NEEDS_CHAIN_ID=1337
NEXT_PUBLIC_NEEDS_CHAIN_NAME=localhost
NEXT_PUBLIC_BLOCKSCAN_LINK=
```
