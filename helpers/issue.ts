import BigNumber from "bignumber.js";

import { IssueBigNumberData, IssueData } from "interfaces/issue-data";

export const OPEN_STATES = ["draft", "open", "ready", "proposal"];

export const parseAmountsToBN = (issue: IssueData) : IssueBigNumberData => ({
  ...issue,
  amount: BigNumber(issue.amount),
  fundingAmount: BigNumber(issue.fundingAmount),
  fundedAmount: BigNumber(issue.fundedAmount),
  rewardAmount: BigNumber(issue.rewardAmount)
});