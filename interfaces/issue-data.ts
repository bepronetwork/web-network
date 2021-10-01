export type IssueState = 'ready' | 'draft' | 'redeemed'| 'in progress' | 'closed' | 'open'

export interface IssueData {
  body: string;
  createdAt: Date;
  developers: developer[];
  dueDate?: string;
  githubId: string;
  issueId: string;
  creatorGithub?: string;
  creatorAddress?: string;
  isIssueinDraft?: boolean;
  amount?: number;
  url?: string;
  numberOfComments: number;
  state: IssueState;
  title: string;
  pullRequests: pullRequest[];
  owner?: string;
  repo?: string;
}

export interface pullRequest {
  createdAt: Date;
  githubId: string;
  id: number;
  issueId: number;
  updatedAt: Date;
}

export interface developer {
  id?: number;
  login?: string;
  avatar_url?: string;
  url?: string;
  type?: string;
}
