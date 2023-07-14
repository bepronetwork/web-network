import { IssueData } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { SearchBountiesPaginated, LeaderBoardPaginated, CuratorsListPaginated } from "types/api";

export interface ExplorePageProps {
  numberOfNetworks: number;
  bounties: SearchBountiesPaginated;
  recentBounties: IssueData[];
  recentFunding: IssueData[];
}

export interface NetworkCuratorsPageProps {
  bounties: SearchBountiesPaginated;
  curators: CuratorsListPaginated;
  totalReadyBounties: number;
  totalDistributed: number;
  totalLocked: number;
}

export interface LeaderBoardPageProps {
  leaderboard: LeaderBoardPaginated;
}

export interface ProposalPageProps {
  proposal: Proposal;
}

interface MyNetworkPageProps {
  bounties: SearchBountiesPaginated;
}