import { IssueData } from "interfaces/issue-data";
import { LeaderBoard } from "interfaces/leaderboard";

export interface PaginatedData<T> {
  count: number;
  rows: T[];
  currentPage: number;
  pages: number;
}

export interface SearchBountiesPaginated extends PaginatedData<IssueData> {
  totalBounties: number;
}

export type LeaderBoardPaginated = PaginatedData<LeaderBoard>;