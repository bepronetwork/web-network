## 1. ETHEREUM NETWORK SETUP

Configure the EVM network explorer, chain identification name and token, for exemple using Kovan.

Or emulate your own block chain using [Ganache](../docs/GANACHE.md), check Ganache [doc]('https://trufflesuite.com/ganache/') for more.

```text
# .env

NEXT_PUBLIC_NATIVE_TOKEN_NAME=ETH
NEXT_PUBLIC_NEEDS_CHAIN_ID=42
NEXT_PUBLIC_NEEDS_CHAIN_NAME=kovan
NEXT_PUBLIC_BLOCKSCAN_LINK=kova.etherscan.com
```

## 2. ADMIN WALLET

The admin wallet is the address of the contracts governor, this person will be able to access the `/parity` page where actions for deploying `ERC20` and `Network` are available. Check Networks Manager [doc](../docs/NETWORK-MANAGER.md). for more

```text
# .env

NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=yourwalletaddress
NEXT_WALLET_PRIVATE_KEY=yourwalletprivatekey
```