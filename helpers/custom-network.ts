import getConfig from "next/config";

import { Network, ThemeColors } from "interfaces/network";

const { publicRuntimeConfig } = getConfig();

export const DefaultNetworkInformation = {
  lock: {
    validated: false,
    amount: 0,
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
