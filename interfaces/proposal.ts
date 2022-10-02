export interface Proposal {
  createdAt: Date | number;
  githubLogin: string;
  id: string;
  isMerged?: boolean;
  issueId?: number;
  pullRequestId?: number;
  scMergeId: string;
  contractId?: number;
  creator?: string;
}

export interface INetworkProposal {
  _id: string;
  disputes: number;
  isDisputed?: boolean;
  canUserDispute?: boolean;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: number;
}

export interface DistribuitonPerUser {
  githubLogin: string;
  address: string;
  oracles: string;
  percentage: number;
  distributedAmount?: number;
  isPRCreator?: boolean;
}
