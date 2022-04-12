


export const WEB3_CONNECTION = process.env.NEXT_PUBLIC_WEB3_CONNECTION;

// Visite https://chainlist.org/ to see more ChainID
export const CURRENT_NETWORK_CHAINID =
  process.env.CURRENT_NETWORK_CHAINID || "42";

// Default parameters to network
export const DISPUTABLE_TIME_MIN =
  process.env.NEXT_PUBLIC_DISPUTABLE_TIME_MIN || 60;
export const DISPUTABLE_TIME_MAX =
  eval(process.env.NEXT_PUBLIC_DISPUTABLE_TIME_MAX) || 20 * 24 * 60 * 60;
export const REDEEM_TIME_MIN = process.env.NEXT_PUBLIC_REDEEM_TIME_MIN || 60;
export const REDEEM_TIME_MAX =
  eval(process.env.NEXT_PUBLIC_REDEEM_TIME_MAX) || 20 * 24 * 60 * 60;
export const COUNCIL_AMOUNT_MIN =
  process.env.NEXT_PUBLIC_COUNCIL_AMOUNT_MIN || 100000;
export const COUNCIL_AMOUNT_MAX =
  process.env.NEXT_PUBLIC_COUNCIL_AMOUNT_MAX || 50000000;
export const DISPUTE_PERCENTAGE_MAX =
  process.env.NEXT_PUBLIC_DISPUTE_PERCENTAGE_MAX || 15;
export const BEPRO_NETWORK_NAME =
  process.env.NEXT_PUBLIC_BEPRO_NETWORK_NAME || "bepro";

export const BEPRO_GITHUB_USER = process.env.NEXT_PUBLIC_BEPRO_GITHUB_USER;

export const CURRENCY_API = process.env.NEXT_PUBLIC_CURRENCY_API;
export const CURRENCY_ID = process.env.NEXT_PUBLIC_CURRENCY_ID;
export const CURRENCY_VSLIST = process.env.NEXT_PUBLIC_CURRENCY_VSLIST;
