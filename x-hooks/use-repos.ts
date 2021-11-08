import useApi from '@x-hooks/use-api';
import {useEffect, useState} from 'react';
import {RepoInfo, ReposList} from '@interfaces/repos-list';
import {useRouter} from 'next/router';

export default function useRepos(): [[RepoInfo, ReposList], {findRepo(id?: number): RepoInfo, loadRepos(): Promise<ReposList>}] {
  const [repoList, setRepoList] = useState<ReposList>([]);
  const [activeRepo, setActiveRepo] = useState<RepoInfo>(null);
  const {query: {repoId}} = useRouter();
  const {getReposList} = useApi();

  function findRepo(_id?: number) {
    return repoList?.find(({id}) => id === (_id || +repoId))
  }

  async function loadRepos() {
    const repos = await getReposList();
    setRepoList(repos);
    return repos;
  }

  useEffect(() => {
    if (!repoList.length)
      return;

    setActiveRepo(findRepo())

  }, [repoId, repoList])
  useEffect(() => { loadRepos() }, [])

  return [[activeRepo, repoList], {findRepo, loadRepos},];
}
