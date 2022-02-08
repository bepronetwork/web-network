export const API = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3005';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const SETTLER_ADDRESS = process.env.NEXT_PUBLIC_SETTLER_ADDRESS;

export const TRANSACTION_ADDRESS = process.env.NEXT_PUBLIC_TRANSACTION_ADDRESS;

export const NETWORK_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_NETWORK_FACTORY_ADDRESS;

export const IPFS_BASE = process.env.NEXT_PUBLIC_IPFS_BASE

export const WEB3_CONNECTION = process.env.NEXT_PUBLIC_WEB3_CONNECTION;

// Set ISO CODES Countrys in UpperCase: https://countrycode.org/
export const COUNTRY_CODE_BLOCKED = process.env.COUNTRY_CODE_BLOCKED || ["US", "SA"]

// Visite https://chainlist.org/ to see more ChainID
export const CURRENT_NETWORK_CHAINID = process.env.CURRENT_NETWORK_CHAINID || "42"