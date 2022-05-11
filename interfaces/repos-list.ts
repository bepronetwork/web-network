import { developer } from "./issue-data";

export interface RepoInfo {
  id: number;
  githubPath: string;
  name: string;
  owner: string;
}

export type IForkInfo = developer;

export type ForksList = {
  [repoId: number]: IForkInfo[];
};
export type ReposList = RepoInfo[];
