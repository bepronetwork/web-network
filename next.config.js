const path = require("path");

require("dotenv").config();

const { i18n } = require("./next-i18next.config");

const publicRuntimeConfig = {
  urls: {
    api: process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000",
    home: process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000",
    events: process.env.NEXT_PUBLIC_EVENTS_API || "http://localhost:3334",
    ipfs: process.env.NEXT_PUBLIC_IPFS_BASE,
    nft: process.env.NEXT_PUBLIC_NFT_URI,
    web3Provider: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
    blockScan: process.env.NEXT_PUBLIC_BLOCKSCAN_LINK
  },
  contracts:{
    settlerToken: process.env.NEXT_PUBLIC_SETTLER_ADDRESS,
    network: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    nftToken: process.env.NEXT_PUBLIC_NFT_ADDRESS,
    networkRegistry: process.env.NEXT_PUBLIC_NETWORK_REGISTRY_ADDRESS,
    transactionalToken: process.env.NEXT_PUBLIC_TRANSACTION_ADDRESS,
  },
  currency:{
    defaultFiat: process.env.NEXT_PUBLIC_CURRENCY_MAIN,
    api: process.env.NEXT_PUBLIC_CURRENCY_API,
    defaultToken: process.env.NEXT_PUBLIC_CURRENCY_ID,
    conversionList: process.env.NEXT_PUBLIC_CURRENCY_VSLIST,
  },
  defaultNetworkConfig: {
    networkName: process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME,
    allowCustomTokens: process.env.NEXT_PUBLIC_ALLOW_CUSTOM_TOKENS,
    adminWalletAddress: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
  },
  nftUri: process.env.NEXT_PUBLIC_NFT_URI,
  web3ProviderConnection: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
  github:{
    botUser: process.env.NEXT_PUBLIC_GH_USER,
  },
  networkParametersLimits:{
    disputableTime:{
      min: process.env.NEXT_PUBLIC_DISPUTABLE_TIME_MIN,
      max: eval(process.env.NEXT_PUBLIC_DISPUTABLE_TIME_MAX),
    },
    reedemTime:{
      min: process.env.NEXT_PUBLIC_REDEEM_TIME_MIN,
      max: eval(process.env.NEXT_PUBLIC_REDEEM_TIME_MAX),
    },
    councilAmount:{
      min: process.env.NEXT_PUBLIC_COUNCIL_AMOUNT_MIN,
      max: process.env.NEXT_PUBLIC_COUNCIL_AMOUNT_MAX,
    },
    disputesPercentage: process.env.NEXT_PUBLIC_DISPUTE_PERCENTAGE_MAX,

  },
  requiredChain: {
    name: process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME,
    id: process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID,
    token: process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME,
  },
  excludedJurisdictions: process.env.NEXT_PUBLIC_COUNTRY_CODE_BLOCKED,
  chainIds: {
    1: 'ethereum',
    42: 'kovan',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    1285: 'moonriver',
    1337: 'localhost',
    1500: 'seneca',
    1501: 'afrodite',
    1502: 'irene',
    1503: 'iris'
  }
}

// Will only be available on the server-side
const serverRuntimeConfig = {
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL
  },
  github: {
    clientId: process.env.NEXT_GH_CLIENT_ID,
    secret: process.env.NEXT_GH_SECRET,
    token: process.env.NEXT_PUBLIC_GH_TOKEN,
    mainBranch: process.env.NEXT_GH_MAINBRANCH,
    owner: process.env.NEXT_GH_OWNER,
    repository: process.env.NEXT_GH_REPO,
  },
  ipApi: {
    key: process.env.NEXT_IP_API_KEY,
    skip: process.env.NEXT_SKIP_IP_API || false
  },
  walletPrivateKey: process.env.NEXT_WALLET_PRIVATE_KEY,
  elasticSearch: {
    username: process.env.NEXT_ELASTIC_SEARCH_USERNAME,
    password: process.env.NEXT_ELASTIC_SEARCH_PASSWORD,
    url: process.env.NEXT_ELASTIC_SEARCH_URL
  },
  infura: {
    host: process.env.NEXT_IPFS_HOST,
    port: process.env.NEXT_IPFS_PORT,
    projectId: process.env.NEXT_IPFS_PROJECT_ID,
    projectSecret: process.env.NEXT_IPFS_PROJECT_SECRET
  },
  schedules: {
    startProcessEventsAt: process.env.SCHEDULES_START_BLOCK
  },
  e2eEnabled: process.env.NEXT_E2E_TESTNET || false,
  scheduleInterval: process.env.NEXT_E2E_TESTNET || 60,
}

module.exports = () => {
  return {
    i18n,
    sassOptions: {
      includePaths: [path.join(__dirname, "styles")]
    },
    images: {
      domains: ["ipfs.infura.io"]
    },
    publicRuntimeConfig,
    serverRuntimeConfig,
    webpack5: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/bepro",
          permanent: true
        }
      ];
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY"
            },
          ]
        },
        {
          source: "/api/(.*)",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: `${process.env.NEXT_PUBLIC_HOME_URL || 'https://development.bepro.network'}` },
            {
              key: "Access-Control-Allow-Headers",
              value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
            }
          ]
        }
      ];
    }
  };
};
