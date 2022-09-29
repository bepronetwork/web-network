import { IssueState } from "interfaces/issue-data";

export const getIssueState = ({
  state,
  amount,
  fundingAmount,
}: {
  state: IssueState;
  amount: number;
  fundingAmount: number;
}) => {
  if (state === "canceled") return state;
  if (amount < fundingAmount) return "funding";
  return state;
};
