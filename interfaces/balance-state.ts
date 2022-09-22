import { OraclesResume } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
export interface BalanceState {
  eth: BigNumber;
  staked: BigNumber;
  bepro: BigNumber;
}

export interface Balance extends BalanceState {
  oracles: OraclesResume;
}
