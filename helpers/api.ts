import { UserRole } from "interfaces/enums/roles";

export const emptyPaginatedData = { count: 0, rows: [], currentPage: 1, pages: 1 };
export const emptyBountiesPaginated = { ...emptyPaginatedData, totalBounties: 0 };
export const emptyCuratorsPaginated = { ...emptyPaginatedData, totalCurators: 0 };
export const emptyNetworkOverview = {
  bounties: {
    draft: 0,
    open: 0,
    ready: 0,
    proposal: 0,
    canceled: 0,
    closed: 0,
  },
  curators: {
    total: 0,
    tokensLocked: 0,
  },
  networkTokenOnClosedBounties: 0,
  members: 0,
};

export const governorRole = (chainId: string | number, networkAddress: string) => 
  `${UserRole.GOVERNOR}:${chainId}_${networkAddress}`;