import { Proposal, INetworkProposal } from "interfaces/proposal";
import { Token } from "interfaces/token";

export type IssueState =
  | "pending"
  | "draft"
  | "open"
  | "in progress"
  | "canceled"
  | "closed"
  | "ready"
  | "done"
  | "disputed"
  | "funding"
  | "proposal";

export type CID = `${string}/${string}`;

export interface IssueData {
  id?: string; // database id
  amount?: string;
  fundingAmount?: string;
  fundedAmount?: string;
  body: string;
  branch?: string;
  createdAt: Date;
  creatorAddress?: string;
  creatorGithub?: string;
  developers: developer[];
  dueDate?: string;
  githubId: string;
  issueId: string; // custom id repo/githubid
  mergeProposals: Proposal[];
  merged: string;
  numberOfComments: number;
  owner?: string;
  pullRequests: pullRequest[];
  repo?: string;
  repository?: Repository;
  repository_id?: number;
  seoImage: string;
  state: IssueState;
  title: string;
  updatedAt?: Date;
  url?: string;
  contractId?: number;
  token?: Token;
  working: string[];
}

export interface Repository {
  id: number;
  githubPath: string;
}

export interface pullRequest {
  createdAt: Date;
  githubId: string;
  githubLogin: string;
  branch: string;
  id: number;
  isMergeable: boolean;
  issueId: number;
  state: string;
  merged: boolean;
  updatedAt: Date;
  issue?: IssueData;
  comments?: IssueDataComment[];
  status?: string;
  reviewers?: string[];
  contractId?: number;
  userBranch?: string;
  userRepo?: string;
}

export interface developer {
  id?: number;
  login?: string;
  avatar_url?: string;
  url?: string;
  type?: string;
}

export interface IssueDataComment {
  body: string;
  created_at: string | number | Date;
  updated_at: string | number | Date;
  author: string;
}

export interface GithubUser {
  login: string;
}

export interface INetworkIssue {
  _id: number;
  canceled: boolean;
  cid: CID | string;
  creationDate: Date | number;
  finalized: boolean;
  issueGenerator: string;
  mergeProposalAmount: number;
  recognizedAsFinished: boolean;
  isDraft: boolean;
  tokensStaked: number;
  networkProposals: INetworkProposal[];
}
