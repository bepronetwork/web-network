import { Token } from "interfaces/token";

export type ConversionItem = {
  value: string;
  label: string;
}

export type ParameterLimit = {
  min?: number;
  max?: number;
}

export type ChainId = {
  [key: string]: string;
}

export type Tier = {
  id: string;
  name: string;
  steps_id: string[];
}

// This type must be kept in sync with the settings in the database
export type SettingsType = {
  chainIds: ChainId;
  contracts: {
    settlerToken: string;
    network: string;
    nftToken: string;
    networkRegistry: string;
    transactionalToken: string;
  };
  currency: {
    defaultToken: string;
    api: string;
    defaultFiat: string;
    conversionList: ConversionItem[];
  };
  defaultNetworkConfig: {
    name: string;
    allowCustomTokens: boolean;
    adminWallet: string;
  };
  github: {
    botUser: string;
  };
  networkParametersLimits: {
    draftTime: ParameterLimit;
    disputableTime: ParameterLimit;
    councilAmount: ParameterLimit;
    disputePercentage: ParameterLimit;
  };
  requiredChain: {
    name: string;
    id: string;
    token: string;
  };
  urls: {
    blockScan: string;
    web3Provider: string;
    api: string;
    nft: string;
    home: string;
    ipfs: string;
  };
  beproToken?: Token
  minBountyValue?: string | number;
  kyc: {
    isKycEnabled: boolean;
    tierList: Tier[];
  }
}