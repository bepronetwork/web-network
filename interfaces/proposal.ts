export interface Proposal {
  createdAt: Date | number;
  githubLogin: string;
  id: number;
  isMerged?: boolean;
  issueId?: number;
  pullRequestId?: number;
  contractId?: number;
  creator?: string;
  network_id: number;
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