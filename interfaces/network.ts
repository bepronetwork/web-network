import { TreasuryInfo } from "@taikai/dappkit";

import { Token } from "interfaces/token";

export interface Network {
  id: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  logoIcon?: string;
  fullLogo?: string;
  tokenName?: string;
  isClosed?: boolean;
  description: string;
  network_id?: number;
  colors?: ThemeColors;
  tokensStaked?: number;
  tokensLocked?: number;
  networkAddress: string;
  creatorAddress: string;
  openBounties?: number;
  totalBounties?: number;
  allowCustomTokens?: boolean;
  tokens?: Token[];
  networkToken?: Token;
  councilAmount?: number;
  disputableTime?: number;
  draftTime?: number;
  oracleExchangeRate?: number;
  mergeCreatorFeeShare?: number;
  proposerFeeShare?: number;
  percentageNeededForDispute?: number;
  treasury?: TreasuryInfo;
}

export interface ThemeColors {
  text: string;
  gray: string;
  fail: string;
  shadow: string;
  oracle: string;
  primary: string;
  success: string;
  warning: string;
  secondary: string;
  background: string;
}

export interface Color {
  code: string;
  label: string;
}
