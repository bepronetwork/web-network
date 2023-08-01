import { IssueData } from "interfaces/issue-data";
import { SupportedChainData } from "interfaces/supported-chain-data";
import { Proposal } from "interfaces/proposal";

import { SearchBountiesPaginated, LeaderBoardPaginated, CuratorsListPaginated, NetworkPaymentsData } from "types/api";

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

interface ProfilePageProps {
  bounties?: SearchBountiesPaginated;
  payments?: NetworkPaymentsData[];
  chains?: SupportedChainData[];
}

export interface MyNetworkPageProps {
  bounties: SearchBountiesPaginated;
}

export interface PaymentsPageProps {
  payments: NetworkPaymentsData[];
  chains: SupportedChainData[];
}