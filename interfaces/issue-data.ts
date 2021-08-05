import {developer} from '../components/issue-list-item';

export interface IssueData {
  body: string,
  createdAt: Date,
  developers: developer[],
  dueDate?: string,
  githubId: string,
  issueId: string,
  creatorGithub?: string,
  creatorAddress?: string,
  isIssueinDraft?: boolean,
  amount?: number,
  url?: string,
  numberOfComments: number,
  state: string,
  title: string,
}
