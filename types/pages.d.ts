import { IssueData } from "interfaces/issue-data";

import { SearchBountiesPaginated } from "types/api";

export interface ExplorePageProps {
  numberOfNetworks: number;
  bounties: SearchBountiesPaginated;
  recentBounties: IssueData[];
  recentFunding: IssueData[];
}

export interface NetworkCuratorsPageProps {
  bounties: SearchBountiesPaginated;
  totalReadyBounties: number;
}