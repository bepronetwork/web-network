import BigNumber from "bignumber.js";

import { OraclesResumeExtended } from "./oracles-state";
export interface BalanceState {
  eth: BigNumber;
  staked: BigNumber;
  bepro: BigNumber;
}

export interface Balance extends BalanceState {
  oracles: OraclesResumeExtended;
}
