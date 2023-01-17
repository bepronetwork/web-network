import {AnalyticEvents, EventName} from "../interfaces/analytics";
import {analytic} from "./analytic";

export const analyticEvents: AnalyticEvents = {
  [EventName.GITHUB_CONNECTED]: [analytic("ga4")],
  [EventName.WALLET_ADDRESS_CHANGED]: [analytic("ga4")],
  [EventName.USER_LOGGED_IN]: [analytic("ga4")],
}