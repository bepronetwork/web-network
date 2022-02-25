import { BranchInfo, BranchsList } from '@interfaces/branchs-list';
import { developer } from '@interfaces/issue-data';
import { ReposList, RepoInfo, ForksList, ForkInfo} from '@interfaces/repos-list';
import useApi from '@x-hooks/use-api';
import useNetwork from '@x-hooks/use-network';
import useOctokit from '@x-hooks/use-octokit';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useState,
  useLayoutEffect,
  useContext,
  useMemo,
  useEffect
} from 'react';

interface IActiveRepo extends RepoInfo{
  forks: ForkInfo[];
  branchs: BranchInfo[];
}

export type RepoListByNetwork = {
  [networkName: string]: ReposList;
};

export interface ReposContextData {
  repoList: ReposList;
  forksList: ForksList;
  branchsList: BranchsList;
  activeRepo: IActiveRepo;
  loadRepos: () => Promise<ReposList>;
  updateActiveRepo: (repoId: number)=> Promise<IActiveRepo>;
  findForks: (repoId: number) => Promise<ForkInfo[]>;
  findBranch: (repoId: number) => Promise<BranchInfo[]>;
  findRepo: (repoId: number) => RepoInfo;
}


const ReposContext = createContext<ReposContextData>({} as ReposContextData);

export const ReposProvider: React.FC = function ({ children }) {
  
  const [repoList, setRepoList] = useState<RepoListByNetwork>({});
  const [branchsList, setBranchsList] = useState<BranchsList>({});
  const [forksList, setForksList] = useState<ForksList>({});
  const [activeRepo, setActiveRepo] = useState<IActiveRepo>(null);

  const {getReposList, getBranchsList} = useApi();
  const {network} = useNetwork()
  const { getForksOf } = useOctokit();
  const {query} = useRouter();
  
  const findRepo = (repoId: number): RepoInfo =>  repoList[network?.name]?.find(({id}) => id === repoId)

  const findForks = useCallback(async(repoId: number): Promise<ForkInfo[]>=>{
    if (forksList[repoId]) return forksList[repoId];
    const repo = findRepo(repoId);
    
    if(!repo) throw new Error(`Repo not found`);

    const {data} = await getForksOf(repo?.githubPath);
    
    const forks = await Promise.all(data.map(({owner}): developer => ({
      id: owner.id,
      login: owner?.login,
      avatar_url: owner.avatar_url,
      url: owner.url,
      type: owner.type
    })))

    setForksList((prevState) => ({
      ...prevState,
      [repoId]: forks,
    }));

    return forks;

  },[repoList, forksList, findRepo, repoList])

  const findBranch = useCallback(async(repoId: number): Promise<BranchInfo[]>=>{
    if (branchsList[repoId]) return branchsList[repoId];
    const branchs = await getBranchsList(repoId, false, network?.name);
    setBranchsList((prevState) => ({
      ...prevState,
      [repoId]: branchs,
    }));
    return branchs;
  },[network, branchsList])

  const loadRepos = useCallback(async (): Promise<ReposList> => {
    if(!network?.name) throw new Error(`Network not exists`);
    const repos = (await getReposList(false, network?.name)) as ReposList;
    if(!repos) throw new Error(`Repos not found`);
    setRepoList((prevState)=>({
      ...prevState,
      [network?.name]: repos
    }));
    return repos;
  },[network]) 

  const updateActiveRepo = useCallback(async(repoId: number): Promise<IActiveRepo>=>{
    const find = findRepo(repoId)
    if(!find) throw new Error(`Repo not found`);
    const forks = forksList[find.id] || await findForks(find?.id);
    const newActiveRepo = {
      ...find,
      forks,
      branchs: branchsList[find.id]
    }
    
    setActiveRepo(newActiveRepo)
    return newActiveRepo;
  },[branchsList, forksList, findForks, findRepo, repoList])

  useLayoutEffect(()=>{
    if(network?.name){
      loadRepos()
      .then(repos =>
        repos.map(repo => findBranch(+repo?.id))
      )
    }
  },[network])

  useEffect(()=>{
    if(repoList[network?.name]?.length > 0){
      repoList[network?.name].forEach(repo => findForks(+repo?.id))
    }
  },[repoList, network])

  useEffect(()=>{
    if(query?.repoId && repoList[network?.name]?.length > 0){
      updateActiveRepo(+query?.repoId)
    }
  },[repoList, query])

  useEffect(()=>{
    console.warn('useRepo',{activeRepo, repoList, branchsList, forksList})
  },[activeRepo, repoList, branchsList, forksList])

  const memorizeValue = useMemo<ReposContextData>(
    () => ({
      repoList: repoList[network?.name],
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
      network,
      repoList,
      branchsList,
      activeRepo,
      forksList,
      loadRepos,
      findForks,
      findBranch,
      updateActiveRepo,
      findRepo
    ]
  );

  return (
    <ReposContext.Provider value={memorizeValue}>
      {children}
    </ReposContext.Provider>
  );
};

export function useRepos(): ReposContextData {
  const context = useContext(ReposContext);

  if (!context) {
    throw new Error('useRepos must be used within an ReposProvider');
  }

  return context;
}

