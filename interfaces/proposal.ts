export interface Proposal {
  disputes: string;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: string;
  _id: string;
  isDisputed?: boolean;
  pullRequestId?: string;
  pullRequestGithubId?: string;
  scMergeId: string;
}
