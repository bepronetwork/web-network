require("dotenv").config();

const publicSettings = [
  { key: "nftUri", type: "string", value: process.env.NEXT_PUBLIC_NFT_URI },
  { key: "apiUri", type: "string", value: process.env.NEXT_PUBLIC_API_HOST },
  { key: "homeUri", type: "string", value: process.env.NEXT_PUBLIC_HOME_URL },
  { key: "blockScanUri", type: "string", value: process.env.NEXT_PUBLIC_BLOCKSCAN_LINK },
  { key: "web3ProviderUri", type: "string", value: process.env.NEXT_PUBLIC_WEB3_CONNECTION },
  { key: "adminAddress", type: "string", value: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS },
  { key: "nftContractAddress", type: "string", value: process.env.NEXT_PUBLIC_NFT_ADDRESS },
  { key: "settlerContractAddress", type: "string", value: process.env.NEXT_PUBLIC_SETTLER_ADDRESS },
  { key: "networkContractAddress", type: "string", value: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS },
  { key: "transactionalContractAddress", type: "string", value: process.env.NEXT_PUBLIC_TRANSACTION_ADDRESS },
  { key: "registryContractAddress", type: "string", value: process.env.NEXT_PUBLIC_NETWORK_REGISTRY_ADDRESS },
];

const Database = require("../db/models");