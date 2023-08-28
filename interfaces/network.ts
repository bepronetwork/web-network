import {TreasuryInfo} from "@taikai/dappkit";
import BigNumber from "bignumber.js";

import {Curator} from "interfaces/curators";
import {IssueData} from "interfaces/issue-data";
import {SupportedChainData} from "interfaces/supported-chain-data";
import {Token} from "interfaces/token";

import { RepoInfo } from "./repos-list";

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
  tokensStaked?: string;
  tokensLocked?: string;
  networkAddress: string;
  creatorAddress: string;
  openBounties?: number;
  totalBounties?: number;
  allowCustomTokens?: boolean;
  councilMembers: string[];
  tokens?: Token[];
  networkToken?: Token;
  councilAmount?: string;
  disputableTime?: number;
  draftTime?: number;
  cancelableTime?: number;
  oracleExchangeRate?: string | number;
  mergeCreatorFeeShare?: string | number;
  proposerFeeShare?: string | number;
  percentageNeededForDispute?: number;
  treasury?: TreasuryInfo;
  isRegistered?: boolean;
  totalSettlerConverted?: string;
  isCouncil?: boolean;
  isGovernor?: boolean;
  isDefault?: boolean;
  curators?: Curator[];
  chain_id?: string;
  totalValueLock?: BigNumber;
  totalIssues?: string;
  totalOpenIssues?: string;
  countIssues?: number;
  chain?: SupportedChainData;
  issues?: IssueData[];
  allowMerge: boolean;
  repositories?: RepoInfo[];
  banned_domains: string[];
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
  dark: string;
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
  mergeCommitAllowed: boolean;
  userPermission?: "ADMIN" | "MAINTAIN" | "READ" | "TRIAGE" | "WRITE";
  checked: boolean;
  name: string;
  fullName: string;
  isSaved?: boolean;
  hasIssues?: boolean;
  label?: string;
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

type TokensLocked = {
  locked: string;
  needed: string;
  validated: boolean;
};
export interface NetworkSettings {
  isSettingsValidated: boolean;
  isLoadingData: boolean;
  forcedNetwork?: Network;
  isAbleToClosed?: boolean;
  registryToken?: Token;
  setForcedNetwork?: (network: Network) => void;
  updateTokenBalance?: ()=> Promise<TokensLocked>
  cleanStorage?: () => void;
  tokensLocked?: TokensLocked;
  details?: {
    allowMerge: boolean;
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
      cancelableTime?: Field<number>;
      oracleExchangeRate?: Field<number>;
      proposerFeeShare?: Field<number>;
      mergeCreatorFeeShare?: Field<number>;
      validated?: boolean;
    };
    validated: boolean;
  };
  github?: {
    repositories: Repository[];
    botPermission: boolean;
    validated: boolean;
    allowMerge: boolean;
  };
  tokens?: {
    settler: string;
    allowedTransactions: Token[],
    allowedRewards: Token[],
    validated: boolean;
  };
  fields?: {
    [key: string]: {
      setter: (value, value2?) => void;
      validator?: (value1, value2?) => Promise<boolean> | boolean | undefined;
    }
  },
  LIMITS: {
    [key: string]: { min?: number; max?: number };
  }
}