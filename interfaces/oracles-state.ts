import { OraclesResume, Delegation } from "@taikai/dappkit";
import BigNumber from "bignumber.js";

export type OraclesActionLabel = "Lock" | "Unlock";
export interface OraclesState {
  oraclesDelegatedByOthers: number;
  amounts: number[];
  addresses: string[];
  tokensLocked: number;
  delegatedToOthers?: number;
  delegatedEntries?: [string, number][];
}

export interface DeletagionExtended extends Delegation {
  amount: BigNumber;
}

export interface OraclesResumeExtended extends OraclesResume {
  locked: BigNumber;
  delegatedToOthers: BigNumber;
  delegatedByOthers: BigNumber;
  delegations: DeletagionExtended[];
}