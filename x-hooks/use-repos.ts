import {useEffect} from "react";

import {useRouter} from "next/router";

import {useAppState} from "../contexts/app-state";
import {changeLoadState} from "../contexts/reducers/change-load";
import {changeNetworkReposActive, changeNetworkReposList} from "../contexts/reducers/change-service";
import {RepoInfo} from "../interfaces/repos-list";
import {WinStorage} from "../services/win-storage";
import useApi from "./use-api";
import useOctokit from "./use-octokit";

export function useRepos() {
  const {state, dispatch} = useAppState();

  const { getRepository, getRepositoryForks, getRepositoryBranches } = useOctokit();
  const {getReposList} = useApi();
  const {query} = useRouter();

  function loadRepos(force = false, name: string) {
    if (!name)
      return;

    console.debug(`Load repos start`);

    const key = `bepro.network:repos:${name}`
    const storage = new WinStorage(key, 3600, `sessionStorage`);
    if (storage.value && !force) {
      dispatch(changeNetworkReposList(storage.value));
      return;
    }

    console.debug(`Load repos no cache`);

    dispatch(changeLoadState(true));

    return getReposList(force, state.Service?.network?.lastVisited)
      .then(repos => {
        if (!repos) {
          console.error(`No repos found for`, state.Service.network.active.name);
          return;
        }

        console.debug(`Loaded repos`, repos);

        storage.value = repos;
        // dispatch(changeNetworkReposList(repos));
        // dispatch(changeLoadState(false));
        return repos;
      })
  }

  function updateActiveRepo() {
    if (!query?.repoId || !state.Service?.network?.repos || state.Service?.network?.repos?.active?.id?.toString() === query?.repoId)
      return;

    const findRepoId = (repo: RepoInfo) => repo.id.toString() === query.repoId;
    const activeRepo = state.Service.network.repos.list.find(findRepoId);

    if (!activeRepo)
      throw new Error(`No repo found for ${query.repoId}`);

    getRepository(activeRepo?.githubPath)
      .then(info => {
        if (!info)
          return []

        return Promise.all([
          Promise.resolve(info),
          getRepositoryBranches(activeRepo.githubPath),
          getRepositoryForks(activeRepo.githubPath),
        ])
      })
      .then(([ghVisibility = false, branches = [], forks = []]) => {
        dispatch(changeNetworkReposActive({ghVisibility, ...activeRepo, branches, forks}))
      })
      .catch(error => {
        console.error(`Failed to load repository`, error);
      })

  }

  useEffect(updateActiveRepo, [query?.repoId, state.Service?.network?.active]);

  return {loadRepos}
}