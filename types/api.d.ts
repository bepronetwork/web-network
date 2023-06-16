import { IssueData } from "interfaces/issue-data";

export interface SearchBountiesPaginated {
  count: number;
  rows: IssueData[];
  currentPage: number;
  pages: number;
  totalBounties: number;
}