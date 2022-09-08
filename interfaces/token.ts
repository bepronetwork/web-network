import { ReactElement } from "react";
export interface Token {
  address: string;
  name: string;
  symbol: string;
  currentValue?: number;
  tokenInfo?: TokenInfo;
  balance?: number;
  decimals?: number;
}

export interface TokenInfo extends Partial<Token> {
    icon: string | ReactElement;
    prices: TokenPrice
}

export interface TokenPrice {
  [key: string]: number;
}