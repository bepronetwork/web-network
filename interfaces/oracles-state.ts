export type OraclesActionLabel = "Lock" | "Unlock"
export interface OraclesState {
  oraclesDelegatedByOthers: number;
  amounts: number[];
  addresses: string[];
  tokensLocked: number;
  delegatedToOthers?: number;
  delegatedEntries?: [string, number][]
}
