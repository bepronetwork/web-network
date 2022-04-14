import { ReactNode } from "react";

export type Currency = {
  name: string;
  ticker: string;
  symbol: string;
  icon?: ReactNode;
};

export type Network = {
  id: string;
  name: string;
  key: string;
  currency: Currency;
  decimals: number;
  explorerURL: string;
  rpcUrls: Array<string>;
};

const DEV: Currency = {
  name: "Test Ethereum",
  ticker: "TETH",
  symbol: "TETH"
};

const ETH: Currency = {
  name: "Ethereum",
  ticker: "ETH",
  symbol: "Ξ"
};

const MOVR: Currency = {
  name: "MOVR",
  ticker: "MOVR",
  symbol: "MOVR"
};

export const NETWORKS: {
  [key: string]: Network;
} = {
  "0x1": {
    id: "1",
    name: "Ethereum Mainnet",
    key: "mainnet",
    currency: ETH,
    decimals: 18,
    explorerURL: "https://etherscan.io",
    rpcUrls: []
  },
  "0x2a": {
    id: "42",
    name: "Kovan Testnet",
    key: "kovan",
    currency: ETH,
    decimals: 18,
    explorerURL: "https://kovan.etherscan.io",
    rpcUrls: []
  },
  "0x505": {
    id: "1285",
    name: "Moonriver",
    key: "moonriver",
    currency: MOVR,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://rpc.moonriver.moonbeam.network"]
  },
  "0x5dc": {
    id: "1500",
    name: "Seneca Testnet",
    key: "seneca",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["http://eth-seneca.taikai.network:8545"]
  }
};
