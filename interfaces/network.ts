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

export interface Field<T> {
  value: T;
  validated?: boolean;
  validator?: Validator<T>;
}

export type Validator<T> = (value: T) => boolean;

export interface NetworkSettings {
  isSettingsValidated: boolean;
  tokensLocked?: {
    amount: number;
    locked: number;
    needed: number;
    validated: boolean;
  };
  details?: {
    name: Field<string>;
    description: Field<string>;
    logoIcon: Field<Icon>;
    fullLogo: Field<Icon>;
    theme: {
      colors: ThemeColors;
      similar: string[];
      black: string[];
    };
    validated: boolean;
  };
  github?: {
    repositories: Repository[];
    botPermission: boolean;
    validated: boolean;
  };
  tokens?: {
    settler: Field<string>;
    bounty: Field<string>;
    validated: boolean;
  }
}