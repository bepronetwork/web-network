import {ProposalData} from '@services/github-microservice';

export type IssueState =  'pending' |  'draft' | 'open' | 'in progress' | 'canceled' | 'closed' | 'ready' | 'done' | 'disputed'

export interface IssueData {
  _id?: string; // sc id
  id?: string; // database id
  body: string;
  createdAt: Date;
  developers: developer[];
  dueDate?: string;
  githubId: string;
  issueId: string; // custom id repo/githubid
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
  repository_id?: number;
  mergeProposals: ProposalData[];
  working: string[];
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
