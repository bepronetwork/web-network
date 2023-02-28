import BigNumber from "bignumber.js";

import { NetworkParameters } from "types/dappkit";

type StrOrNmb = string | number;
type Limit = {
  min: StrOrNmb,
  max: StrOrNmb
};

type NetworkLimits = {
  [key in NetworkParameters]: Limit;
}

const betweenIn = 
  (value: StrOrNmb, min: StrOrNmb, max: StrOrNmb) => BigNumber(value).gte(min) && BigNumber(value).lte(max);

const limits = (min?: StrOrNmb, max?: StrOrNmb) => ({ min, max });

export const NETWORK_LIMITS: NetworkLimits = {
  councilAmount: limits(101000, 100000000000),
  disputableTime: limits(60, 1728000),
  draftTime: limits(60, 1728000),
  oracleExchangeRate: limits(0),
  mergeCreatorFeeShare: limits(0, 10),
  proposerFeeShare: limits(0, 10),
  percentageNeededForDispute: limits(0, 51),
  cancelableTime: limits(15552000)
};

export const ParameterValidator = (param: NetworkParameters, value: StrOrNmb): boolean => {
  const { min, max } = NETWORK_LIMITS[param] || {};

  const validators = {
    councilAmount: betweenIn(value, min, max),
    disputableTime: betweenIn(value, min, max),
    draftTime: betweenIn(value, min, max),
    oracleExchangeRate: BigNumber(value).gt(min),
    mergeCreatorFeeShare: betweenIn(value, min, max),
    proposerFeeShare: betweenIn(value, min, max),
    percentageNeededForDispute: betweenIn(value, min, max),
    cancelableTime: BigNumber(value).gte(min)
  };

  return validators[param];
};