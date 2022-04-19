## 1. ETHEREUM NETWORK SETUP

First you neeed set the default ethereum network used to make transactions for the contract. To this is recomended follow the [Tutorial](../docs/GANACHE.md) to use [Ganache]('https://trufflesuite.com/ganache/') for emulate your own block chain locally, but if your prefer can use any ethereum development network supported by [MetaMask](https://docs.metamask.io/guide/ethereum-provider.html#chain-ids).

For exemple, using kovan network.

```text
# .env

NEXT_PUBLIC_NATIVE_TOKEN_NAME=ETH
NEXT_PUBLIC_NEEDS_CHAIN_ID=42
NEXT_PUBLIC_NEEDS_CHAIN_NAME=kovan
NEXT_PUBLIC_BLOCKSCAN_LINK=kova.etherscan.com
```

## 2. ADMIN WALLET

Only just owner of the admin wallet have authority to manager default network and make new contract deploys. To leanr more about it, your can visite [Manager Networks](../docs/NETWORK-MANAGER.md).

```text
# .env

NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=yourwalletaddress
NEXT_WALLET_PRIVATE_KEY=yourwalletprivatekey
```