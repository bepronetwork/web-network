import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
export interface Token {
  address: string;
  name: string;
  symbol: string;
}

export interface TokenInfo extends Partial<Token> {
    icon: string;
    prices: TokenPrice
}

export interface TokenPrice {
  [key: string]: number;
}

export const BEPRO_TOKEN: Token = {
  address: publicRuntimeConfig?.contract?.settler,
  name: "BEPRO",
  symbol: "$BEPRO"
};