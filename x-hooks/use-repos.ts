import useApi from '@x-hooks/use-api';
import {useEffect, useState} from 'react';
import {RepoInfo, ReposList} from '@interfaces/repos-list';
import {useRouter} from 'next/router';

const repoList = [];
export default function useRepos() {
  const [repoList, setRepoList] = useState<ReposList>([]);
  const [activeRepo, setActiveRepo] = useState<RepoInfo>(null);
  const {query: {repoId}} = useRouter();
  const {getReposList} = useApi();

  function findRepo(id: string) {
    return repoList?.find(({id}) => id === +repoId)
  }

  useEffect(() => { setActiveRepo(findRepo(repoId as string)) }, [repoId])
  useEffect(() => { getReposList().then(setRepoList) }, [])

  return {activeRepo, findRepo, repoList};
}
