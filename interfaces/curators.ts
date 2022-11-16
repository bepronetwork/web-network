export interface Curator {
    address: string;
    acceptedProposals?: number;
    disputedProposals?: number;
    tokensLocked?: string;
    networkId?: number;
    isCurrentlyCurator?: boolean
}

export interface SearchCuratorParams {
    page?: string;
    address?: string;
    isCurrentlyCurator?: boolean;
    networkName?: string;
    sortBy?: string;
    order?: string;
    search?: string;
  }