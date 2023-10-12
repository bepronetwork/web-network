export const DEFAULT_CANCEL_FEE = 1;
export const DEFAULT_CLOSE_FEE = 5;
export const DEFAULT_DISPUTE_TIME = 259200;
export const DEFAULT_PERCENTAGE_FOR_DISPUTE = 3;
export const DEFAULT_DRAFT_TIME = 86400;
export const DEFAULT_COUNCIL_AMOUNT = 25000000;
export const DEFAULT_ORACLE_EXCHANGE_RATE = 1;
export const DEFAULT_MERGER_FEE = 0.05;
export const DEFAULT_PROPOSER_FEE = 2;
export const DEFAULT_CANCELABLE_TIME = 15811200;
export const BODY_CHARACTERES_LIMIT = 65536;
export const BOUNTY_TITLE_LIMIT = 131;
export const MAX_TAGS = 3;
export const IM_AN_ADMIN = `I'm an admin`;
export const NOT_AN_ADMIN = `Not an admin`;
export const WANT_TO_CREATE_NETWORK = `I want to create a network`;
export const MISSING_ADMIN_SIGNATURE = `Missing admin signature`;
export const NOT_ADMIN_WALLET = `Wrong wallet`;
export const MISSING_CHAIN_ID = `Missing chain id`;
export const CHAIN_ID_NOT_SUPPORTED = `Given chain id is not supported`;
export const NO_NETWORKS_FOR_GIVEN_CHAIN_ID = `No networks for given chain id`;
export const CHAIN_NOT_CONFIGURED = `Chain not configured`;
export const WRONG_PARAM_URL = name => `Url ${name} was malformed`;
export const WRONG_PARAM_ADDRESS = name => `Address ${name} is malformed or 0 address`;
export const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
export const IM_AM_CREATOR_ISSUE = `I am the owner of this bounty`;
export const NOT_AN_CREATOR_ISSUE = `Not an creator issue`;
export const MISSING_CREATOR_ISSUE_SIGNATURE = `Missing creator issue signature`;
export const IM_AM_CREATOR_NETWORK = `I am the owner of this network`;
export const NOT_AN_CREATOR_NETWORK = `Not an network creator`;
export const MISSING_CREATOR_NETWORK_SIGNATURE = `Missing network creator signature`;
export const UNSUPPORTED_CHAIN = "unsupported";
export const MAX_INTEGER_SOLIDITY = 2**256 - 1;
export const NETWORK_DIVISOR = 1000000;
export const DISCORD_LINK = "https://discord.gg/layerx";
export const DAPPKIT_LINK = "https://sdk.dappkit.dev/";
export const SUPPORT_LINK = "https://support.bepro.network/en/";
export const DOCS_LINK = "https://docs.bepro.network/";
export const TWITTER_LINK = "https://twitter.com/bepronet";
export const INSTAGRAM_LINK = "https://www.instagram.com/bepronetwork/";
export const LINKEDIN_LINK = "https://linkedin.com/company/bepronet";
export const TERMS_AND_CONDITIONS_LINK = "https://www.bepro.network/terms";
export const PRIVACY_POLICY_LINK = "https://taikai.network/privacy";
export const SMALL_TOKEN_SYMBOL_LENGTH = 6;
export const LARGE_TOKEN_SYMBOL_LENGTH = 12;
export const BOOTSTRAP_BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1238,
  xxl: 1400
};
export const DAY_IN_SECONDS = 24 * 60 * 60;
export const MILLISECONDS = 1000;
export const MINUTE_IN_MS = 60 * MILLISECONDS;
export const STATIC_URL_PATHS = [
  "bounty",
  "network",
  "networks",
  "leaderboard",
  "explore",
  "new-network",
  "setup",
  "explore",
  "create-bounty",
  "api-doc",
  "administration",
  "404",
  "profile",
  "auth",
  "deliverable",
  "proposal",
  "curators",
  "bounties",
];
export const BOUNTY_TAGS = [
  {
    type: "Technology",
    tags: [
      "Full Stack Development",
      "Front-End Development",
      "Back-End Development",
      "Mobile App Development",
      "Web Design",
      "Ecommerce Website Development",
      "UX/UI Design",
      "CMS Development",
      "Testing",
      "Scripting & Automation",
    ]
  },
  {
    type: "Marketing",
    tags: [
      "SEO",
      "Social Media Marketing",
      "Other Digital Marketing",
      "Sales & Business Development",
      "Marketing Strategy",
      "Marketing Automation",
    ]
  },
  {
    type: "Design",
    tags: [
      "Graphic Design",
      "Logo Design",
      "Illustration",
      "Branding",
      "Packaging Design",
      "Print Design",
      "Presentation Design",
      "Infographic Design",
      "Motion Graphics Design",
      "User Experience Design",
    ]
  },
  {
    type: "Writing and Translation",
    tags: [
      "Content Writing",
      "Copywriting",
      "Technical Writing",
      "Creative Writing",
      "Translation",
      "Proofreading & Editing",
      "Article Writing",
      "Blog Writing",
      "Resume Writing",
    ]
  },
  {
    type: "Legal",
    tags: [
      "Contract Law",
      "Intellectual Property Law",
      "Corporate Law",
      "Employment Law",
      "Immigration Law",
      "Legal Writing",
      "Legal Research",
      "Tax Law",
      "Trademark Law",
    ]
  },
  {
    type: "Video and Audio production",
    tags: [
      "Video Editing",
      "Audio Editing",
      "Voice Over",
      "Sound Design",
      "Music Production",
      "Audio Production",
      "Video Production",
      "Podcast Production",
      "Audio Mixing",
      "Audio Mastering",
    ]
  },
];