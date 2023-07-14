import { IssueData } from "./issue-data";

export interface Payment {
  address: string;
  ammount: number;
  id: number;
  issue: IssueData;
  issueId: number;
  transactionHash: string;
  labelBounty?: string;
  labelToken?: string;
  handleItemClick?: () => void;
}