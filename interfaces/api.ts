import { ReviewTypes } from "types/octokit";

export interface RequestParams {
  networkName?: string;
  wallet?: string;
}
export interface User {
  githubLogin: string;
  address?: string;
  createdAt: string;
  id: number;
  updatedAt: string;
  email?: string;
  isEmailConfirmed?: string;
  emailVerificationCode?: string;
  emailVerificationSentAt?: string | Date;
}

export interface PastEventsParams {
  id?: number;
  fromBlock: number;
  toBlock?: number;
  chainId?: string;
  issueId?: string;
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
  isNeedCountsAndTokensLocked?: boolean;
  chainId?: string;
  chainShortName?: string;
}

export interface SearchActiveNetworkParams {
  page?: string;
  creatorAddress?: string;
  sortBy?: string;
  order?: string;
  isClosed?: boolean;
  isRegistered?: boolean;
  name?: string;
}

export interface CreatePrePullRequestParams extends RequestParams {
  repoId: string;
  issueGithubID: string;
  title: string;
  description: string;
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
}

export interface CreateReviewParams extends RequestParams {
  issueId: string;
  pullRequestId: string;
  githubLogin: string;
  body: string;
  event?: ReviewTypes;
}

export interface PatchUserParams extends RequestParams {
  githubLogin: string;
  migrate?: boolean;
  reset?: boolean;
}

export interface updateIssueParams extends RequestParams {
  repoId: string | number;
  ghId: string | number;
  networkName: string;
  body?: string;
  tags?: string[];
}