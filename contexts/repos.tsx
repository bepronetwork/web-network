import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
  useEffect
} from "react";

import { useRouter } from "next/router";

import { changeLoadState } from "contexts/reducers/change-load-state";

import { BranchInfo, BranchsList } from "interfaces/branchs-list";
import { developer } from "interfaces/issue-data";
import {
  ReposList,
  RepoInfo,
  ForksList,
  IForkInfo
} from "interfaces/repos-list";

import useApi from "x-hooks/use-api";
import useOctokit from "x-hooks/use-octokit";

import { ApplicationContext } from "./application";
import { useNetwork } from "./network";

interface IActiveRepo extends RepoInfo {
  forks: IForkInfo[];
  branchs: BranchInfo[];
}

export type RepoListByNetwork = {
  [networkName: string]: {
    repos: ReposList;
    lastUpdated: number;
  };
};

export interface ReposContextData {
  repoList: ReposList;
  forksList: ForksList;
  branchsList: BranchsList;
  activeRepo: IActiveRepo;
  loadRepos: () => Promise<ReposList>;
  updateActiveRepo: (repoId: number) => Promise<IActiveRepo>;
  findForks: (repoId: number) => Promise<IForkInfo[]>;
  findBranch: (repoId: number) => Promise<BranchInfo[]>;
  findRepo: (repoId: number) => RepoInfo;
}

const TTL = 60 * 5 * 100; // 5 Min

const ReposContext = createContext<ReposContextData>({} as ReposContextData);

export const ReposProvider: React.FC = function ({ children }) {
  const [repoList, setRepoList] = useState<RepoListByNetwork>({});
  const [branchsList, setBranchsList] = useState<BranchsList>({});
  const [forksList, setForksList] = useState<ForksList>({});
  const [activeRepo, setActiveRepo] = useState<IActiveRepo>(null);

  const { getReposList, getBranchsList } = useApi();
  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { getForksOf } = useOctokit();
  const { query } = useRouter();

  const findRepo = (repoId: number): RepoInfo =>
    repoList[activeNetwork?.name]?.repos?.find(({ id }) => id === repoId);
  const isLoadedReposByNetwork = (): boolean =>
    repoList[activeNetwork?.name]?.repos?.length > 0;

  const findForks = useCallback(async (repoId: number, forced?: boolean): Promise<IForkInfo[]> => {
    if (forksList[repoId] && !forced) return forksList[repoId];
    const repo = findRepo(repoId);

    if (!repo) throw new Error("Repo not found");

    const data = await getForksOf(repo?.githubPath);

    const forks = await Promise.all(data?.map(({ owner }): developer => ({
            id: owner.id,
            login: owner?.login,
            avatar_url: owner.avatar_url,
            url: owner.url,
            type: owner.type
    })));

    setForksList((prevState) => ({
        ...prevState,
        [repoId]: forks
    }));

    return forks;
  },
    [forksList, findRepo]);

  const findBranch = useCallback(async (repoId: number, forced?: boolean): Promise<BranchInfo[]> => {
    if (branchsList[repoId] && !forced) return branchsList[repoId];

    const branchs = await getBranchsList(repoId, false, activeNetwork?.name);
    setBranchsList((prevState) => ({
        ...prevState,
        [repoId]: branchs
    }));
    return branchs;
  },
    [activeNetwork, branchsList]);

  const loadRepos = useCallback(async (): Promise<ReposList> => {
    if (!activeNetwork?.name) throw new Error("Network not exists");

    const noExpired =
      +new Date() - repoList[activeNetwork?.name]?.lastUpdated <= TTL;

    if (repoList[activeNetwork?.name] && noExpired)
      return repoList[activeNetwork?.name].repos;

    dispatch(changeLoadState(true));

    const repos = (await getReposList(false, activeNetwork?.name)) as ReposList;

    if (!repos) throw new Error("Repos not found");

    setRepoList((prevState) => ({
      ...prevState,
      [activeNetwork?.name]: {
        repos,
        lastUpdated: +new Date()
      }
    }));

    dispatch(changeLoadState(false));
    return repos;
  }, [activeNetwork, repoList]);

  const updateActiveRepo = useCallback(async (repoId: number): Promise<IActiveRepo> => {
    if (activeRepo?.id === repoId) return activeRepo;

    const findedRepo = findRepo(repoId);
    if (!findedRepo) throw new Error("Repo not found");

    const noExpired =
        +new Date() - repoList[activeNetwork?.name].lastUpdated <= TTL;

    const [branchs, forks] = await Promise.all([
        findBranch(+findedRepo?.id, !noExpired),
        findForks(+findedRepo?.id, !noExpired)
    ]);

    const newActiveRepo = {
        ...findedRepo,
        forks,
        branchs
    };
    setActiveRepo(newActiveRepo);
    return newActiveRepo;
  },
    [findForks, findRepo, repoList, activeNetwork, activeRepo]);

  useEffect(() => {
    if (query?.repoId && isLoadedReposByNetwork()) {
      updateActiveRepo(+query?.repoId);
    }
  }, [repoList, query]);

  /**
   * Load Repos Every Change Network;
   */
  useEffect(() => {
    if (activeNetwork?.name) {
      loadRepos();
    }
  }, [activeNetwork]);

  useEffect(() => {
    //console.warn('useRepo',{activeRepo, repoList, branchsList, forksList})
  }, [activeRepo, repoList, branchsList, forksList]);

  const memorizeValue = useMemo<ReposContextData>(() => ({
      repoList: repoList[activeNetwork?.name]?.repos,
      branchsList,
      activeRepo,
      forksList,
      loadRepos,
      findForks,
      findBranch,
      updateActiveRepo,
      findRepo
  }),
                                                  [
      activeNetwork,
      repoList,
      branchsList,
      activeRepo,
      forksList,
      loadRepos,
      findForks,
      findBranch,
      updateActiveRepo,
      findRepo
                                                  ]);

  return (
    <ReposContext.Provider value={memorizeValue}>
      {children}
    </ReposContext.Provider>
  );
};

export function useRepos(): ReposContextData {
  const context = useContext(ReposContext);

  if (!context) {
    throw new Error("useRepos must be used within an ReposProvider");
  }

  return context;
}
