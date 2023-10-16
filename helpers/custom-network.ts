import { Defaults } from "@taikai/dappkit";

import { ThemeColors } from "interfaces/network";
import { Token } from "interfaces/token";

const ZeroField = () => ({
  value: 0,
  validated: undefined
});

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
      cancelFee: ZeroField(),
      closeFee: ZeroField(),
      validated: false
    },
    parameters: {
      draftTime: ZeroField(),
      disputableTime: ZeroField(),
      percentageNeededForDispute: ZeroField(),
      councilAmount: ZeroField(),
      cancelableTime: ZeroField(),
      oracleExchangeRate: ZeroField(),
      proposerFeeShare: ZeroField(),
      mergeCreatorFeeShare: ZeroField(),
      validated: undefined
    },
    validated: undefined
  },
  tokens: {
    settler: "",
    settlerTokenMinAmount: "",
    allowedTransactions: [] as Token[],
    allowedRewards: [] as Token[],
    validated: false,
  }
};