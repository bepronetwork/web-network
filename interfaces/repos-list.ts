import { developer } from "./issue-data";

export interface RepoInfo {
  id: number;
  githubPath: string;
  name?: string;
  owner?: string;
}

export type ForkInfo = developer;

export type ForksList = {
  [repoId: number]: ForkInfo[];
};
export type ReposList = RepoInfo[];
