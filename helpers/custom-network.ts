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
    validated: false,
  }
};

export const DefaultNetworkInformation = {
  lock: {
    validated: false,
    amountLocked: 0,
    amountNeeded: 0
  },
  network: {
    validated: false,
    data: {
      logoIcon: {
        preview: "",
        raw: undefined as File
      },
      fullLogo: {
        preview: "",
        raw: undefined as File
      },
      displayName: {
        data: "",
        validated: undefined
      },
      networkDescription: "",
      colors: {
        data: {} as ThemeColors,
        similar: [] as string[],
        black: [] as string[]
      }
    }
  },
  repositories: {
    validated: false,
    data: [],
    permission: false
  },
  tokens: {
    validated: false,
    networkToken: '',
    nftToken: {
      address: '',
      error: false
    }
  }
};

export const handleNetworkAddress = (network: Network) => {
  return network?.name === publicRuntimeConfig?.networkConfig?.networkName
    ? publicRuntimeConfig?.contract?.address
    : network?.networkAddress;
};
