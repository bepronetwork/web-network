export interface BranchInfo {
  branch: string;
  protected?: boolean;
}

export type BranchesList = {
  [repoId: number]: BranchInfo[];
};
