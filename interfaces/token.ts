import { ReactElement } from "react";

import { getSettingsFromSessionStorage } from "helpers/settings";

const settings = getSettingsFromSessionStorage();
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
  address: settings?.contracts?.settlerToken,
  name: "Bepro Network",
  symbol: "BEPRO"
};