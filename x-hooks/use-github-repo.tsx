import { useRepos } from '@contexts/repos';
import {useEffect, useState} from 'react';

export default function useGithubRepo(id: string, path: string) {
  const [githubPath, setGithubPath] = useState(``);
  const {findRepo} = useRepos()

  function loadRepoId() {
    if (!id)
      return;

    setGithubPath(findRepo(+id)?.githubPath)
  }

  useEffect(loadRepoId, [id]);
  useEffect(() => setGithubPath(path), [path])

  return [githubPath, loadRepoId];
}
