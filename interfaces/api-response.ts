export interface User {
  githubHandle: string;
  githubLogin: string;
  address?: string;
  createdAt: string;
  id: number;
  updatedAt: string;
  accessToken?: string;
}

export interface ProposalData {
  id: number;
  issueId: number;
  scMergeId: string;
  pullRequestId: number;
  pullRequest?: {
    id: number;
    githubId: string;
    issueId: number;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}