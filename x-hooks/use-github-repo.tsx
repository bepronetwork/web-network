import {useEffect, useState} from 'react';
import GithubMicroService from '@services/github-microservice';

export default function useGithubRepo(id: string, path: string) {
  const [githubPath, setGithubPath] = useState(``);

  function loadRepoId() {
    if (!id)
      return;

    GithubMicroService.getReposList()
                      .then(repos => repos.find(({id: _id}) => _id === id)?.githubPath)
                      .then(setGithubPath)
  }

  useEffect(loadRepoId, [id]);
  useEffect(() => setGithubPath(path), [path])

  return [githubPath, loadRepoId];
}
