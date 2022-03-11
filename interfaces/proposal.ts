export interface Proposal{
  createdAt: string;
  githubLogin: string;
  id: string;
  isMerged?: boolean;
  issueId?: number;
  pullRequestId?: number;
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