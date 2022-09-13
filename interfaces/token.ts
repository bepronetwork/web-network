import { ReactElement } from "react";
export interface Token {
  id?: number;
  address: string;
  name: string;
  symbol: string;
  currentValue?: number;
  tokenInfo?: TokenInfo;
  balance?: number;
  decimals?: number;
  isTransactional?: boolean;
}

export interface TokenInfo extends Partial<Token> {
    icon: string | ReactElement;
    prices: TokenPrice
}

export interface TokenPrice {
  [key: string]: number;
}