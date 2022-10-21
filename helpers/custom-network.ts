import { Defaults } from "@taikai/dappkit";

import { Repository, ThemeColors } from "interfaces/network";
import { Token } from "interfaces/token";

export const DefaultNetworkSettings = {
  isSettingsValidated: false,
  isAbleToClosed: false,
  tokensLocked: {
    amount: "0",
    locked: "0",
    needed: "0",
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
    validated: false,
  },
  settings: {
    theme: {
      colors: {} as ThemeColors,
      similar: [] as string[],
      black: [] as string[],
    },
    treasury: {
      address: {
        value: Defaults.nativeZeroAddress,
        validated: undefined
      },
      cancelFee: {
        value: 0,
        validated: undefined
      },
      closeFee: {
        value: 0,
        validated: undefined
      },
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
      },
      validated: undefined
    },
    validated: undefined
  },
  github: {
    repositories: [] as Repository[],
    botPermission: false,
    validated: false,
  },
  tokens: {
    settler: "",
    allowedTransactions: [] as Token[],
    allowedRewards: [] as Token[],
    validated: false,
  }
};