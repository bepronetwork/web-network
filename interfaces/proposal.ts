import BigNumber from "bignumber.js";

export interface Proposal {
  creationDate: number;
  createdAt: Date | number;
  githubLogin: string;
  id: number;
  isMerged?: boolean;
  issueId?: number;
  pullRequestId?: number;
  contractId?: number;
  creator?: string;
  network_id: number;
  distributions?: DistribuitonPerUser[]
  contractCreationDate?: number;
  disputeWeight?: BigNumber;
  refusedByBountyOwner?: boolean;
  isDisputed?: boolean;
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

export interface DistribuitonPerUser {
  githubLogin?: string;
  address: string;
  oracles?: string;
  percentage: number;
  distributedAmount?: string;
}
