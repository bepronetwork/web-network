import { OraclesResume } from "@taikai/dappkit";
export interface BalanceState {
  eth: number;
  staked: number;
  bepro: number;
}

export interface IBalance extends BalanceState {
  oracles: OraclesResume;
}
