import { Defaults } from "@taikai/dappkit";
import getConfig from "next/config";

import { Network, Repository, ThemeColors } from "interfaces/network";

const { publicRuntimeConfig } = getConfig();

export const DefaultNetworkSettings = {
  isSettingsValidated: false,
  tokensLocked: {
    amount: 0,
    locked: 0,
    needed: 0,
    validated: false,
  },
  details: {
    name: {
      value: "",
      validated: undefined
    },
    description: "",
    iconLogo: {
      value: {
        preview: "",
        raw: undefined as File
      },
      validated: undefined
    },
    fullLogo: {
      value: {
        preview: "",
        raw: undefined as File
      },
      validated: undefined
    },
    theme: {
      colors: {} as ThemeColors,
      similar: [] as string[],
      black: [] as string[],
    },
    validated: false,
  },
  github: {
    repositories: [] as Repository[],
    botPermission: false,
    validated: false,
  },
  tokens: {
    settler: "",
    bounty: "",
    bountyURI: "",
    validated: false,
  },
  treasury: {
    address: {
      value: Defaults.nativeZeroAddress,
      validated: undefined
    },
    cancelFee: 1,
    closeFee: 5,
    validated: false
  },
  parameters: {
    draftTime: {
      value: 0,
      validated: undefined
    },
    disputableTime: {
      value: 0,
      validated: undefined
    },
    percentageNeededForDispute: {
      value: 0,
      validated: undefined
    },
    councilAmount: {
      value: 0,
      validated: undefined
    }
  }
};

export const handleNetworkAddress = (network: Network) => {
  return network?.name === publicRuntimeConfig?.networkConfig?.networkName
    ? publicRuntimeConfig?.contract?.address
    : network?.networkAddress;
};
