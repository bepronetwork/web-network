## 1. ETHEREUM NETWORK SETUP

Make sure you have the [Metamask](https://metamask.io/download/) extensions installed.
Then fill in the ENV file with Ethereum EVM Network, for exemple using Kovan.
<br>

```text
# .env

# Create a new infura provider (or any other web3 provider) and add the id here
NEXT_PUBLIC_WEB3_CONNECTION=wss://kovan.infura.io/ws/v3/

# MetaMask Network Configs
NEXT_PUBLIC_NATIVE_TOKEN_NAME=ETH
NEXT_PUBLIC_NEEDS_CHAIN_ID=42
NEXT_PUBLIC_NEEDS_CHAIN_NAME=kovan
NEXT_PUBLIC_BLOCKSCAN_LINK=kova.etherscan.com
```

Or emulate your own block chain using [Ganache](../docs/GANACHE.md).

## 2. ADMIN WALLET

The admin wallet is the address of the contracts governor, this person will be able
to manage the default network, also to access the `/administration` page where actions for manage default settings for `ERC20` and `Network` are available. Check Networks Manager [doc](../docs/NETWORK-MANAGER.md) for more.

```text
# .env

NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=yourwalletaddress
NEXT_WALLET_PRIVATE_KEY=yourwalletprivatekey
```
