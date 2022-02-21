import useApi from '@x-hooks/use-api';
import {useEffect, useState} from 'react';
import {RepoInfo, ReposList} from '@interfaces/repos-list';
import {BranchInfo, BranchsList} from '@interfaces/branchs-list';
import {useRouter} from 'next/router';

type UseRepoResponse = 
  [
    [RepoInfo, ReposList, BranchsList], 
    { 
      findRepo(id?: number): RepoInfo, 
      loadRepos(): Promise<ReposList>
      getBranchs(id: number): Promise<BranchInfo[]>
    }
  ]

export default function useRepos(): UseRepoResponse {
  const [repoList, setRepoList] = useState<ReposList>([]);
  const [branchsList, setBranchsList] = useState<BranchsList>({});
  const [activeRepo, setActiveRepo] = useState<RepoInfo>(null);
  const {query: {repoId}} = useRouter();
  const {getReposList, getBranchsList} = useApi();

  function findRepo(_id?: number) {
    return repoList?.find(({id}) => id === (_id || +repoId))
  }

  async function getBranchs(id: number){
    if(branchsList[id]) return branchsList[id]
    
    const branchs = await getBranchsList(id);
    
    setBranchsList((prevState) => ({
      ...prevState,
      id: branchs,
    }))

    return branchs
  }

  async function loadRepos() {
    const repos = await getReposList();
    setRepoList(repos);
    return repos;
  }

  useEffect(() => {
    if (!repoList?.length)
      return;

    setActiveRepo(findRepo())

  }, [repoId, repoList])
  useEffect(() => { loadRepos() }, [])
  
  return [
    [activeRepo, repoList, branchsList], 
    {findRepo, loadRepos, getBranchs},
  ];
}
