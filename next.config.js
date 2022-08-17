const path = require("path");

require("dotenv").config();

const { i18n } = require("./next-i18next.config");

const publicRuntimeConfig = {
  urls: {
    api: process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000",
    events: process.env.NEXT_PUBLIC_EVENTS_API || "http://localhost:3334",
    home: process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"
  }
};

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
  twitter: {
    apiKey: process.env.NEXT_TWITTER_APIKEY,
    apiSecret: process.env.NEXT_TWITTER_APIKEY_SECRET,
    accessToken: process.env.NEXT_TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.NEXT_TWITTER_ACCESS_SECRET
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
