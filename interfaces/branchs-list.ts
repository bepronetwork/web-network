export interface BranchInfo {
  branch: string;
  protected?: boolean;
}

export type BranchsList = {
  [repoId: number]: BranchInfo[];
};
