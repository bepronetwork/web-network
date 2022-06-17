export interface User {
  githubHandle: string;
  githubLogin: string;
  address?: string;
  createdAt: string;
  id: number;
  updatedAt: string;
  accessToken?: string;
}

export interface ProposalData {
  id: number;
  issueId: number;
  scMergeId: string;
  pullRequestId: number;
  pullRequest?: {
    id: number;
    githubId: string;
    issueId: number;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PastEventsParams {
  id? :number;
  fromBlock?: number;
  toBlock?: number;
}

export interface SearchNetworkParams {
  page?: string;
  name?: string;
  creatorAddress?: string;
  networkAddress?: string;
  sortBy?: string;
  order?: string;
  search?: string
}