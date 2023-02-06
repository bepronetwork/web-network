import { ReactElement } from "react";

import BigNumber from "bignumber.js";

export type TokenType = 'reward' | 'transactional';

export interface Token {
  id?: number;
  address: string;
  name: string;
  symbol: string;
  currentValue?: number | string;
  tokenInfo?: TokenInfo;
  balance?: string | BigNumber;
  totalSupply?: BigNumber;
  decimals?: number;
  isTransactional?: boolean;
  network_tokens?: NetworkToken;
  isAllowed?: boolean;
  isReward?: boolean;
}

export interface NetworkToken {
  id: number;
  networkId: number;
  tokenId: number;
  isTransactional: boolean;
  isReward: boolean;
}

export interface TokenInfo extends Partial<Token> {
    icon: string | ReactElement;
    prices: TokenPrice
}

export interface TokenPrice {
  [key: string]: number;
}