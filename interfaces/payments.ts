import { IssueData } from "./issue-data";

export interface IPayment {
  address: string;
  ammount: number;
  id: number;
  issue: IssueData;
  issueId: number;
  transactionHash: string;
}