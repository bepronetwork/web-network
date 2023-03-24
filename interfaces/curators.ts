export interface Curator {
    address: string;
    acceptedProposals?: number;
    disputedProposals?: number;
    tokensLocked?: string;
    delegatedToMe?: string;
    networkId?: number;
    disputes?: number;
    isCurrentlyCurator?: boolean
}

export interface SearchCuratorParams {
    page?: string;
    address?: string;
    isCurrentlyCurator?: boolean;
    networkName?: string;
    sortBy?: string;
    order?: string;
    chainShortName?: string;
}