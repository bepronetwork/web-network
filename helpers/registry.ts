import BigNumber from "bignumber.js";
import { isZeroAddress } from "ethereumjs-util";
import { isAddress } from "web3-utils";

import { RegistryParameters } from "types/dappkit";

type StrOrNmb = string | number;

const betweenIn = 
  (value: StrOrNmb, min: StrOrNmb, max: StrOrNmb) => BigNumber(value).gte(min) && BigNumber(value).lte(max);

const limits = (min?: StrOrNmb, max?: StrOrNmb) => ({ min, max });

export const REGISTRY_LIMITS = {
  closeFeePercentage: limits(0, 90),
  cancelFeePercentage: limits(0, 100),
  networkCreationFeePercentage: limits(0, 99),
  lockAmountForNetworkCreation: limits(0)
}

export const RegistryValidator = (param: RegistryParameters, value: StrOrNmb) => {
  const { min, max } = REGISTRY_LIMITS[param] || {};

  const validators = {
    closeFeePercentage: betweenIn(value, min, max),
    cancelFeePercentage: betweenIn(value, min, max),
    treasury: isAddress(value?.toString()) && !isZeroAddress(value?.toString()),
    networkCreationFeePercentage: betweenIn(value, min, max),
    lockAmountForNetworkCreation: BigNumber(value).gt(0)
  }

  return validators[param];
}