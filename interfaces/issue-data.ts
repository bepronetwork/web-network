import {ProposalData} from './api-response';

export type IssueState =  'pending' |  'draft' | 'open' | 'in progress' | 'canceled' | 'closed' | 'ready' | 'done' | 'disputed'

export type CID = `${string}/${string}`;

export interface IssueData {
  _id?: string; // sc id
  id?: string; // database id
  body: string;
  createdAt: Date;
  updatedAt?: Date;
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
  branch?: string;
  repository_id?: number;
  mergeProposals: ProposalData[];
  working: string[];
  merged: string;
  seoImage?: string;
  repository?: Repository
}

export interface Repository {
  id: number,
  githubPath: string
}

export interface pullRequest {
  createdAt: Date;
  githubId: string;
  githubLogin: string;
  id: number;
  isMergeable: boolean;
  issueId: number;
  state: string;
  merged: boolean;
  updatedAt: Date;
  issue?: IssueData;
  comments?: Comment[];
  reviewers?: string[];
}

export interface developer {
  id?: number;
  login?: string;
  avatar_url?: string;
  url?: string;
  type?: string;
}

export interface Comment {
  body: string;
  created_at: string;
  user: GithubUser;
}

export interface GithubUser {
  login: string;
}
