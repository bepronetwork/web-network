import BigNumber from "bignumber.js";

import { IssueState } from "interfaces/issue-data";

export const getIssueState = ({
  state,
  amount,
  fundingAmount,
}: {
  state: IssueState;
  amount: BigNumber;
  fundingAmount: BigNumber;
}) => {
  if (state === "closed") return state;
  if (state === "canceled") return state;
  if (amount?.lt(fundingAmount)) return "funding";
  
  return state;
};
