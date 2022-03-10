import {IssueData} from './issue-data'


export interface IPullRequest{
  id: number;
  githubId: number;
  issueId: number;
  githubLogin: string;
  branch: string;
  reviewers: [];
}
export interface Proposal {
  id: string;
  createdAt: string;
  githubLogin: string;
  isDisputed?: boolean;
  isMerged?: boolean;
  issue: IssueData;
  pullRequest:IPullRequest;
  scMergeId: string;
}

export interface INetworkProposal{
  _id: string;
  disputes: number;
  isDisputed?: boolean;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: number;
}