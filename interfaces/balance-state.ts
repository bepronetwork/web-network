import { OraclesState } from "interfaces/oracles-state";

export interface BalanceState {
  eth: number;
  staked: number;
  bepro: number;
}

export interface IBalance extends BalanceState {
  oracles: OraclesState;
}
