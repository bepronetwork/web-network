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
  search?: string;
  isClosed?: boolean;
  isRegistered?: boolean;
  isDefault?: boolean;
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
  mergeProposalId: string | number;
  address: string;
}

export interface CreateReviewParams extends RequestParams {
  issueId: string;
  pullRequestId: string;
  githubLogin: string;
  body: string;
}

export interface PatchUserParams extends RequestParams {
  githubLogin: string;
  migrate?: boolean;
  reset?: boolean;
}