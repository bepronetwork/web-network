import BigNumber from "bignumber.js";

import { User } from "interfaces/api";
import { BaseModel } from "interfaces/db/base";
import { Deliverable, IssueBigNumberData, IssueData, IssueDataComment } from "interfaces/issue-data";

export interface ProposalDistribution extends BaseModel {
  recipient: string;
  percentage: number;
  proposalId: number;
  user?: User;
}

export interface ProposalDisputes extends BaseModel {
  issueId: number;
  proposalId: number;
  address: string;
  weight: BigNumber;
}

export interface Proposal extends BaseModel {
  githubLogin: string;
  isMerged?: boolean;
  issueId?: number;
  deliverableId?: number;
  contractId?: number;
  creator?: string;
  network_id: number;
  distributions?: ProposalDistribution[];
  contractCreationDate?: Date;
  disputeWeight?: BigNumber;
  refusedByBountyOwner?: boolean;
  isDisputed?: boolean;
  disputes?: ProposalDisputes[];
  issue?: IssueData | IssueBigNumberData;
  deliverable?: Deliverable;
  comments?: IssueDataComment[];
}

export interface INetworkProposal {
  _id: string;
  disputes: number;
  canUserDispute?: boolean;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: number;
}

type amount  = {
  value: string;
  percentage: string;
}

export interface DistributedAmounts {
  treasuryAmount: amount;
  mergerAmount: amount;
  proposerAmount: amount;
  proposals: {
    value: string;
    percentage: string;
    recipient: string;
    githubLogin?: string;
  }[];
}