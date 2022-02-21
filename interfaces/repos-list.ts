import { developer } from "./issue-data";

export interface RepoInfo {
  id: number;
  githubPath: string;
}

export interface ForkInfo extends developer{
}

export type ForksList = {
  [repoId: number]: ForkInfo[];
};
export type ReposList = RepoInfo[];
