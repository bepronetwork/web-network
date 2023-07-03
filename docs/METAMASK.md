## 1. ETHEREUM NETWORK SETUP

Make sure you have the [Metamask](https://metamask.io/download/) extension installed.
Then fill in the ENV file with Ethereum EVM Network, for exemple using Goerli.
<br>

```text
# .env

# Create a new infura provider (or any other web3 provider) and add the id here
NEXT_PUBLIC_WEB3_CONNECTION=https://ethereum-goerli.publicnode.com

# MetaMask Network Configs
NEXT_PUBLIC_NATIVE_TOKEN_NAME=ETH
NEXT_PUBLIC_NEEDS_CHAIN_ID=5
NEXT_PUBLIC_NEEDS_CHAIN_NAME=eth-goerli
NEXT_PUBLIC_BLOCKSCAN_LINK=goerli.etherscan.io
```

Or emulate your own blockchain using [Ganache](../docs/GANACHE.md).

## 2. ADMIN WALLET

The admin wallet is the address of the contracts governor, this person will be able
to manage the default network, also to access the `/administration` page where actions to manage the default settings for `ERC20` and `Network` are available. Check Networks Manager [doc](../docs/NETWORK-MANAGER.md) for more.

```text
# .env

NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=yourwalletaddress
NEXT_WALLET_PRIVATE_KEY=yourwalletprivatekey
```
