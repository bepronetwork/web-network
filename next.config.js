const path = require("path");

const { i18n } = require("./next-i18next.config");
require("dotenv").config();

// Will be available on both server and client
const publicRuntimeConfig = {
  adminWalletAddress: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
  homeUrl: process.env.NEXT_PUBLIC_HOME_URL,
  apiUrl: process.env.NEXT_PUBLIC_API_HOST,
  contract:{
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    settler: process.env.NEXT_PUBLIC_SETTLER_ADDRESS,
    transaction: process.env.NEXT_PUBLIC_TRANSACTION_ADDRESS,
    nft: process.env.NEXT_PUBLIC_NFT_ADDRESS,
    registry: process.env.NEXT_PUBLIC_NETWORK_REGISTRY_ADDRESS
  },
  nftUri: process.env.NEXT_PUBLIC_NFT_URI,
  web3ProviderConnection: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
  github:{
    user: process.env.NEXT_PUBLIC_GH_USER,
  },
  metaMask:{
    tokenName: process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME,
    chainId: process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID,
    chainName: process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME,
    blockScanUrl: process.env.NEXT_PUBLIC_BLOCKSCAN_LINK
  },
  countryCodeBlocked: process.env.NEXT_PUBLIC_COUNTRY_CODE_BLOCKED,
  ipfsUrl: process.env.NEXT_PUBLIC_IPFS_BASE,
  networkConfig:{
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
    networkName: process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME,
    allowCustomTokens: process.env.NEXT_PUBLIC_ALLOW_CUSTOM_TOKENS
  },
  currency:{
    main: process.env.NEXT_PUBLIC_CURRENCY_MAIN,
    apiUrl: process.env.NEXT_PUBLIC_CURRENCY_API,
    currencyId: process.env.NEXT_PUBLIC_CURRENCY_ID,
    currencyCompareList: process.env.NEXT_PUBLIC_CURRENCY_VSLIST,
  },
  networkIds: {
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
  authSecret: process.env.NEXTAUTH_SECRET,
  authUrl: process.env.NEXTAUTH_URL,
  github:{
    clientId: process.env.NEXT_GH_CLIENT_ID,
    secret: process.env.NEXT_GH_SECRET,
    mainBranch: process.env.NEXT_GH_MAINBRANCH,
    owner: process.env.NEXT_GH_OWNER,
    repo: process.env.NEXT_GH_REPO,
    token: process.env.NEXT_PUBLIC_GH_TOKEN,
  },
  ipApi:{
  key: process.NEXT_IP_API_KEY,
    skip: process.env.NEXT_SKIP_IP_API || false,
  },
  walletPrivateKey: process.env.NEXT_WALLET_PRIVATE_KEY,
  elasticSearch:{
    url: process.env.NEXT_ELASTIC_SEARCH_URL,
    username: process.env.NEXT_ELASTIC_SEARCH_USERNAME,
    password: process.env.NEXT_ELASTIC_SEARCH_PASSWORD,
  },
  infura:{
    host: process.env.NEXT_IPFS_HOST,
    port: process.env.NEXT_IPFS_PORT,
    projectId: process.env.NEXT_IPFS_PROJECT_ID,
    projectSecret: process.env.NEXT_IPFS_PROJECT_SECRET
  },
  twitter:{
    apiKey: process.env.NEXT_TWITTER_APIKEY,
    apiSecret: process.env.NEXT_TWITTER_APIKEY_SECRET,
    accessToken: process.env.NEXT_TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.NEXT_TWITTER_ACCESS_SECRET,
  },
  schedules: {
    startProcessEventsAt: process.env.SCHEDULES_START_BLOCK,
  },
  e2e:  process.env.NEXT_E2E_TESTNET === "true" ? true : false || false,
}

const importConfigsFromDB = async () => {
  console.log("Configs imported");
}


module.exports = async () => {
  await importConfigsFromDB();
  
  return {
    i18n,
    sassOptions: {
      includePaths: [path.join(__dirname, "styles")]
    },
    images: {
      domains: ["ipfs.infura.io"]
    },
    serverRuntimeConfig,
    publicRuntimeConfig,
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
