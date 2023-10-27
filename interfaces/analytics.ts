export enum EventName {
  GITHUB_CONNECTED= "github_connected",
  WALLET_ADDRESS_CHANGED = "wallet_changed",
  USER_LOGGED_IN = "user_logged_in",
  TASK_SECTION_CHANGE = "task_section_change",
}

export type AnalyticType = "ga4";

export interface Analytic<T = any> {
  type: AnalyticType
}

export interface AnalyticEvents {
  [eventName: string]: Analytic[],
}