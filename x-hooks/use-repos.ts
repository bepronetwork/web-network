import {useRouter} from "next/router";

import {useAppState} from "../contexts/app-state";
import {changeLoadState} from "../contexts/reducers/change-load";
import {changeNetworkReposActive, changeNetworkReposList} from "../contexts/reducers/change-service";
import {RepoInfo} from "../interfaces/repos-list";
import {WinStorage} from "../services/win-storage";
import useApi from "./use-api";
import useOctokit from "./use-octokit";
import {changeSpinners} from "../contexts/reducers/change-spinners";
import {usePrevious} from "@restart/hooks";
import {useRef} from "react";

export function useRepos() {
  const {state, dispatch} = useAppState();

  const { getRepository, getRepositoryForks, getRepositoryBranches } = useOctokit();
  const {getReposList} = useApi();
  const {query} = useRouter();
  const lastNameRef = useRef(state?.Service?.network?.lastVisited)
  const prevName = usePrevious(lastNameRef);

  function loadRepos(force = false, name = state?.Service?.network?.lastVisited) {
    if (!name || state.spinners?.repos || prevName.current === name)
      return;

    console.log(prevName.current, prevName, name);

    dispatch(changeSpinners.update({repos: true}));

    console.log(`GET REPOS`);

    const key = `bepro.network:repos:${name}`
    const storage = new WinStorage(key, 3600, `sessionStorage`);
    if (storage.value && !force) {
      console.log(`REPOS USE STORAGE`);
      if (!state.Service?.network?.repos?.list) {
        console.log(`REPOS USE STORAGE DISPATCHED`);
        dispatch(changeNetworkReposList(storage.value));
      }

      return;
    }

    dispatch(changeLoadState(true));

    console.log(`REPOS LOADING`)

    getReposList(force, name)
      .then(repos => {
        if (!repos) {
          console.error(`No repos found for`, name);
          return;
        }
        
        storage.value = repos;
        dispatch(changeNetworkReposList(repos));
        dispatch(changeLoadState(false));
        dispatch(changeSpinners.update({repos: false}))
        console.log(`GOT REPOS LIST FROM SOURCE`);
      })
  }

  function updateActiveRepo(id = null) {
    if (!( id || query?.repoId) || !state.Service?.network?.repos || state.Service?.network?.repos?.active?.id?.toString() === (id || query?.repoId))
      return;

    const findRepoId = (repo: RepoInfo) => repo.id.toString() === (id || query.repoId).toString();
    const activeRepo = state.Service.network.repos.list.find(findRepoId);

    if (!activeRepo)
      throw new Error(`No repo found for ${id || query.repoId}`);

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

  return {loadRepos, updateActiveRepo}
}