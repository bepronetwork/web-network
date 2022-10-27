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

const GLMR: Currency = {
  name: "GLMR",
  ticker: "GLMR",
  symbol: "GLMR"
}

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
    rpcUrls: ["https://eth-seneca.taikai.network:8080"]
  },
  "0x5dd": {
    id: "1501",
    name: "Afrodite Testnet",
    key: "afrodite",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://eth-afrodite.taikai.network:8080"]
  },
  "0x5de": {
    id: "1502",
    name: "Irene Testnet",
    key: "irene",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://eth-irene.taikai.network:8080"]
  },
  "0x5df": {
    id: "1503",
    name: "Iris Testnet",
    key: "iris",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://eth-iris.taikai.network:8080"]
  },
  "0x507": {
    id: "1287",
    name: "Moonbase Testnet",   
    key: "moonbase",
    currency: ETH,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"]
  },
  "0x504": {
    id: "1284",
    name: "Moonbeam",   
    key: "moonbeam",
    currency: GLMR,
    decimals: 18,
    explorerURL: "https://moonscan.io/",
    rpcUrls: ["https://rpc.api.moonbeam.network"]
  },
  "0x5e0": {
    id: "1504",
    name: "Diogenes Testnet",
    key: "diogenes",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://eth-diogenes.taikai.network:8080"]
  },
  "0x5e1": {
    id: "1505",
    name: "Aurelius Testnet",
    key: "aurelius",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://blockscout.moonriver.moonbeam.network",
    rpcUrls: ["https://eth-aurelius.taikai.network:8080"]
  },
  "0x4e454152": {
    id: "1313161554",
    name: "Aurora",
    key: "aurora",
    currency: DEV,
    decimals: 18,
    explorerURL: "https://aurorascan.dev",
    rpcUrls: ["https://mainnet.aurora.dev"]
  }
};
