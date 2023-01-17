export enum EventName {
  GITHUB_CONNECTED= "github_connected",
  WALLET_ADDRESS_CHANGED = "wallet_changed",
}

export type AnalyticType = "ga4";

export interface Analytic<T = any> {
  type: AnalyticType
}

export interface AnalyticEvents {
  [eventName: string]: Analytic[],
}