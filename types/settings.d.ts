export type ConversionItem = {
  value: string;
  label: string;
}

export type ParameterLimit = {
  min?: number;
  max?: number;
}

// This type must be kept in sync with the settings in the database
export type SettingsType = {
  chainIds: {
    1: "ethereum";
    3: "ropsten";
    4: "rinkeby";
    5: "goerli";
    42: "kovan";
    1285: "moonriver";
    1287: "moonbase";
    1337: "localhost";
    1503: "iris";
    1502: "irene";
    1501: "afrodite";
    1500: "seneca";
  };
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
  excludedJurisdictions: string[];
}