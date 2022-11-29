export interface SearchLeaderBoard {
    page?: string;
    address?: string;
    sortBy?: string;
    order?: string;
    time?: string;
    search?: string;
 }

export interface LeaderBoard {
    address: string;
    githubHandle?: string;
    numberNfts?: number;
}
