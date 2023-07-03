import { Curator } from "interfaces/curators";
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

export interface CuratorsListPaginated extends PaginatedData<Curator> {
  totalCurators: number;
}

export interface NetworkOverviewData {
  name: string;
  networkAddress: string;
  bounties: {
    draft?: number;
    open?: number;
    ready?: number;
    proposal?: number;
    canceled?: number;
    closed?: number;
  };
  curators: {
    total: number;
    tokensLocked: number;
  };
  networkTokenOnClosedBounties: number;
  members: number;
}