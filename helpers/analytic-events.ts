import {AnalyticEvents, EventName} from "../interfaces/analytics";
import {analytic} from "./analytic";

export const analyticEvents: AnalyticEvents = {
  [EventName.GITHUB_CONNECTED]: [analytic("ga4")],
  [EventName.WALLET_ADDRESS_CHANGED]: [analytic("ga4")],
  task_section_change_SelectNetwork: [analytic("ga4")],
  task_section_change_BountyDetails: [analytic("ga4")],
  task_section_change_RewardInformation: [analytic("ga4")],
  task_section_change_CreateTask: [analytic("ga4")],
}