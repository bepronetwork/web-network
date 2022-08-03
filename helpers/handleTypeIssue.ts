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
  if (amount < fundingAmount) return "funding";
  return state;
};
