import useApi from '@x-hooks/use-api';
import {useEffect, useState} from 'react';
import {RepoInfo, ReposList} from '@interfaces/repos-list';
import {useRouter} from 'next/router';

export default function useRepos(): [[RepoInfo, ReposList], {findRepo(id: string): RepoInfo, loadRepos(): Promise<ReposList>}] {
  const [repoList, setRepoList] = useState<ReposList>([]);
  const [activeRepo, setActiveRepo] = useState<RepoInfo>(null);
  const {query: {repoId}} = useRouter();
  const {getReposList} = useApi();

  function findRepo(id: string) {
    return repoList?.find(({id}) => id === +repoId)
  }

  async function loadRepos() {
    const repos = await getReposList();
    setRepoList(repos);
    return repos;
  }

  useEffect(() => { setActiveRepo(findRepo(repoId as string)) }, [repoId])
  useEffect(() => { loadRepos() }, [])

  return [[activeRepo, repoList], {findRepo, loadRepos},];
}
