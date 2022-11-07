const path = require("path");

require("dotenv").config();

const { i18n } = require("./next-i18next.config");

const publicRuntimeConfig = {
  urls: {
    api: process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000",
    home: process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000",
    events: process.env.NEXT_PUBLIC_EVENTS_API || "http://localhost:3334",
    ipfs: process.env.NEXT_PUBLIC_IPFS_BASE
  },
  defaultName: process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME
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
    token: process.env.NEXT_GH_TOKEN,
    mainBranch: process.env.NEXT_GH_MAINBRANCH,
    owner: process.env.NEXT_GH_OWNER,
    repository: process.env.NEXT_GH_REPO,
  },
  walletPrivateKey: process.env.NEXT_WALLET_PRIVATE_KEY,
  elasticSearch: {
    username: process.env.NEXT_ELASTIC_SEARCH_USERNAME,
    password: process.env.NEXT_ELASTIC_SEARCH_PASSWORD,
    url: process.env.NEXT_ELASTIC_SEARCH_URL
  },
  infura: {
    uploadEndPoint: process.env.NEXT_IPFS_UPLOAD_ENDPOINT,
    projectId: process.env.NEXT_IPFS_PROJECT_ID,
    projectSecret: process.env.NEXT_IPFS_PROJECT_SECRET
  },
  schedules: {
    startProcessEventsAt: process.env.SCHEDULES_START_BLOCK
  },
  e2eEnabled: process.env.NEXT_E2E_TESTNET || false,
  scheduleInterval: process.env.NEXT_E2E_TESTNET || 60,
  logLevel: process.env.LOG_LEVEL
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
          destination: `/${publicRuntimeConfig.defaultName}`,
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
