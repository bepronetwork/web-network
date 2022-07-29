export interface RequestParams {
  networkName?: string;
  wallet?: string;
}
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

export interface CreatePrePullRequestParams extends RequestParams {
  repoId: string;
  issueGithubID: string;
  title: string;
  description: string;
  username: string;
  branch: string;
}

export interface CancelPrePullRequestParams extends RequestParams {
  repoId: string;
  issueGithubId: string;
  bountyId: string;
  issueCid: string; 
  pullRequestGithubId: string;
  customNetworkName: string;
  creator: string;
  userBranch: string;
  userRepo: string;
}

export interface StartWorkingParams extends RequestParams {
  issueId: string;
  githubLogin: string;
}

export interface MergeClosedIssueParams extends RequestParams {
  issueId: string;
  pullRequestId: string;
  mergeProposalId: string;
  address: string;
}

export interface CreateReviewParams extends RequestParams {
  issueId: string;
  pullRequestId: string;
  githubLogin: string;
  body: string;
}

export interface PatchUserParams extends RequestParams {
  githubHandle: string;
  migrate?: boolean;
}