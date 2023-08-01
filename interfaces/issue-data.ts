import BigNumber from "bignumber.js";

import { Network } from "interfaces/network";
import { Payment } from "interfaces/payments";
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
  | "partial-funded"
  | "proposal";

export type CID = `${string}/${string}`;

export interface IssueData {
  id?: string; // database id
  amount?: string;
  fundingAmount?: string;
  fundedAmount?: string;
  rewardAmount?: string;
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
  network_id?: number;
  pullRequests: PullRequest[];
  repo?: string;
  repository?: Repository;
  repository_id?: number;
  seoImage: string;
  nftImage?: string;
  state: IssueState;
  title: string;
  updatedAt?: Date;
  url?: string;
  contractId?: number;
  transactionalToken?: Token;
  rewardToken?: Token;
  working: string[];
  fundedAt?: Date;
  benefactors?: fundingBenefactor[];
  disputes?: Disputes[];
  payments: Payment[];
  network?: Network;
  tags: string[];
  isDraft: boolean;
  isClosed: boolean;
  isFundingRequest: boolean;
  isFunded: boolean;
  isCanceled: boolean;
  isReady?: boolean;
  hasReward?: boolean;
  fundedPercent: number;
  isKyc: boolean;
  visible: boolean;
  kycTierList: number[];
  contractCreationDate?: string;
}

export interface Disputes {
  address: string;
  weight: number;
  issueId: number;
  proposalId: number;
}

export interface IssueBigNumberData 
  extends Omit<IssueData , "amount" | "fundingAmount" | "fundedAmount" | "rewardAmount"> {
  amount: BigNumber;
  fundingAmount: BigNumber;
  fundedAmount: BigNumber;
  rewardAmount: BigNumber;
}

export interface IssueNetwork extends IssueBigNumberData {
  networkName?: string;
  totalValueLock?: BigNumber;
  issues?: IssueBigNumberData[]
}
export interface IssueSearch {
  rows: IssueNetwork[] | [],
  count: number,
  pages: number,
  currentPage: number
}

export interface Repository {
  id: number;
  githubPath: string;
  network?: Network;
  mergeCommitAllowed?: boolean;
}

export interface PullRequest {
  createdAt: Date;
  githubId: string;
  githubLogin: string;
  id: number;
  isMergeable: boolean;
  issueId: number;
  state: string;
  userAddress: string;
  merged: boolean;
  updatedAt: Date;
  issue?: IssueData;
  comments?: IssueDataComment[];
  reviews?: IssueDataComment[];
  status?: string;
  reviewers?: string[];
  contractId?: number;
  userBranch?: string;
  userRepo?: string;
  network_id: number;
  hash?: string;
  approvals?: {
    total: number;
  };
  isCanceled: boolean;
  isReady: boolean;
  isCancelable: boolean;
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

export interface fundingBenefactor {
  amount: BigNumber;
  address: string;
  contractId: number;
  issueId: number;
  withdrawn?: boolean
}
