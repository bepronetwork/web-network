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
  danger: string;
  shadow: string;
  oracle: string;
  primary: string;
  success: string;
  warning: string;
  secondary: string;
  background: string;
  info: string;
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

export interface Field<T> {
  value: T;
  validated?: boolean;
}

export interface NetworkSettings {
  isSettingsValidated: boolean;
  forcedNetwork?: Network;
  setForcedNetwork?: (network: Network) => void;
  tokensLocked?: {
    locked: number;
    needed: number;
    validated: boolean;
  };
  details?: {
    name: Field<string>;
    description: string;
    iconLogo?: Field<Icon>;
    fullLogo?: Field<Icon>;
    validated: boolean;
  };
  settings?: {
    theme?: Theme;
    treasury?: {
      address?: Field<string>;
      cancelFee?: Field<number>;
      closeFee?: Field<number>;
      validated?: boolean;
    };
    parameters?: {
      draftTime?: Field<number>;
      disputableTime?: Field<number>;
      percentageNeededForDispute?: Field<number>;
      councilAmount?: Field<number>;
      validated?: boolean;
    };
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
    bountyURI: string;
    validated: boolean;
  };
  fields?: {
    [key: string]: {
      setter: (value, value2?) => void;
      validator?: (value1, value2?) => Promise<boolean> | boolean | undefined;
    }
  }
}