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
  state: string;
  title: string;
  pullRequests: pullRequest[];
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
