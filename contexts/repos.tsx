import { BranchsList } from '@interfaces/branchs-list';
import { ReposList, RepoInfo } from '@interfaces/repos-list';
import useApi from '@x-hooks/use-api';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
  useEffect
} from 'react';


export interface ReposContextData {
  repoList: ReposList;
  branchsList: BranchsList;
  activeRepo: RepoInfo;
  loadRepos: () => Promise<ReposList>;
  loadBranch: (repoId: string) => Promise<BranchsList>
  updateActiveRepo: (id: number)=> RepoInfo
  findRepo: (id?:number, repoId?:number) => RepoInfo
}


const ReposContext = createContext<ReposContextData>({} as ReposContextData);

export const ReposProvider: React.FC = function ({ children }) {
  
  const [repoList, setRepoList] = useState<ReposList>([]);
  const [branchsList, setBranchsList] = useState<BranchsList>({});
  const [activeRepo, setActiveRepo] = useState<RepoInfo>(null);

  const {getReposList, getBranchsList} = useApi();
  const {query} = useRouter();
  
  const loadBranch = useCallback(async(repoId: string): Promise<BranchsList>=>{
    if (branchsList[repoId]) return branchsList[repoId];
    const branchs = await getBranchsList(repoId);
    setBranchsList((prevState) => ({
      ...prevState,
      id: branchs,
    }));
    return branchs;
  },[branchsList])

  const loadRepos = useCallback(async (): Promise<ReposList> => {
    const repos = (await getReposList()) as ReposList;
    setRepoList(repos);
    return repos;
  },[])

  const findRepo = (_id?: number, repoId?: number): RepoInfo =>  repoList?.find(({id}) => id === (_id || repoId))

  const updateActiveRepo = useCallback((id: number): RepoInfo=>{
    const find = findRepo(id)
    if(!find) throw new Error(`Repo not found`);
    setActiveRepo(find)
    return find;
  },[])

  useEffect(()=>{
    loadRepos()
    .then(repos => 
      repos.map(repo => loadBranch(`${repo?.id}`))
    )
  },[])

  useEffect(()=>{
    if(query.repoId){
      setActiveRepo(findRepo(null, +query?.repoId))
    }
  },[query])

  const memorizeValue = useMemo<ReposContextData>(
    () => ({
      repoList,
      branchsList,
      activeRepo,
      loadRepos,
      loadBranch,
      updateActiveRepo,
      findRepo
    }),
    [repoList, branchsList, activeRepo]
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
