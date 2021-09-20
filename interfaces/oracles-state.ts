export interface OraclesState {
  oraclesDelegatedByOthers: string;
  amounts: string[];
  addresses: string[];
  tokensLocked: string;
  delegatedToOthers?: number;
  delegatedEntries?: [string, number][]
}
