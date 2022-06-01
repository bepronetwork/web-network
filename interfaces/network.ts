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

export interface Icon {
  preview: string;
  raw: File;
}

export interface Repository {
  checked: boolean;
  name: string;
  fullName: string;
  isSaved?: boolean;
  hasIssues?: boolean;
}

export interface Theme {
  colors: ThemeColors;
  similar: string[];
  black: string[];
}

export interface NetworkSettings {
  isSettingsValidated: boolean;
  tokensLocked?: {
    amount: number;
    locked: number;
    needed: number;
    validated: boolean;
  };
  details?: {
    name: string;
    description: string;
    logoIcon?: Icon;
    fullLogo?: Icon;
    theme?: Theme;
    validated: boolean;
  };
  github?: {
    repositories: Repository[];
    botPermission: boolean;
    validated: boolean;
  };
  tokens?: {
    settler: string;
    bounty: string;
    validated: boolean;
  }
}