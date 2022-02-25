import { developer } from "./issue-data";

export interface RepoInfo {
  id: number;
  githubPath: string;
}

export interface IForkInfo extends developer{
}

export type ForksList = {
  [repoId: number]: IForkInfo[];
};
export type ReposList = RepoInfo[];
