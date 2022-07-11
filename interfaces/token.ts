import { ReactElement } from "react";

import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
export interface Token {
  address: string;
  name: string;
  symbol: string;
  currentValue?: number;
  tokenInfo?: TokenInfo;
  balance?: number;
}

export interface TokenInfo extends Partial<Token> {
    icon: string | ReactElement;
    prices: TokenPrice
}

export interface TokenPrice {
  [key: string]: number;
}

export const BEPRO_TOKEN: Token = {
  address: publicRuntimeConfig?.contract?.settler,
  name: "Bepro Network",
  symbol: "BEPRO"
};