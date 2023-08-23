import {useState} from "react";

import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";
import {
  changeNetworkReposActive,
  changeNetworkReposActiveViewerPerm, 
  changeNetworkReposList
} from "contexts/reducers/change-service";
import {changeSpinners} from "contexts/reducers/change-spinners";

import {RepoInfo} from "interfaces/repos-list";

import {WinStorage} from "services/win-storage";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import useOctokit from "x-hooks/use-octokit";

export function useRepos() {
  const {query} = useRouter();

  const [loadedActiveRepo, setActiveRepo] = useState(null);

  const {state, dispatch} = useAppState();

  const { chain } = useChain();
  const {getReposList} = useApi();
  const { getRepository, getRepositoryForks, getRepositoryBranches, getRepositoryViewerPermission } = useOctokit();

  function getStorageFor(storageFor: "repos" | "active-repo", repo?: string) {
    const isActiveRepo = storageFor === "active-repo";
    const keyComplement = isActiveRepo ? `:${repo}` : "";
    
    const key = `bepro.network:${storageFor}:${query?.network}:${query?.chain}${keyComplement}`;

    const storage = new WinStorage(key, 60000, "sessionStorage");

    return storage;
  }

  function loadRepos(force = false) {
    const name = query?.network;

    if (!name || !chain || state.spinners?.repos || !state.Service?.network?.active)
      return;

    const storage = getStorageFor("repos");

    if (storage.value && !force) {
      if (!state.Service?.network?.repos?.list) {
        dispatch(changeNetworkReposList(storage.value));
      }

      return;
    }

    dispatch(changeLoadState(true));
    dispatch(changeSpinners.update({repos: true}));

    getReposList(force, name.toString(), chain.chainId.toString())
      .then(repos => {
        if (!repos) {
          console.error(`No repos found for`, name);
          return;
        }

        storage.value = repos;
        dispatch(changeNetworkReposList(repos));
      })
      .catch(error => console.debug("Failed to loadRepos", error))
      .finally(() => {
        dispatch(changeLoadState(false));
        dispatch(changeSpinners.update({repos: false}));
      });
  }

  function dispatchRepoUpdates(active, viewerPermission) {
    dispatch(changeNetworkReposActive(active));
    dispatch(changeNetworkReposActiveViewerPerm(viewerPermission));
  }

  function updateActiveRepo(id = null) {
    if (!(id ||
          query?.repoId) ||
          !state.Service?.network?.repos ||
          state.Service?.network?.repos?.active?.id?.toString() === (id || query?.repoId))
      return;
     
    const findRepoId = (repo: RepoInfo) => repo.id.toString() === (id || query.repoId).toString();
    const activeRepo = state.Service.network.repos.list.find(findRepoId);

    if (activeRepo?.githubPath === loadedActiveRepo?.githubPath)
      return;

    setActiveRepo(activeRepo);

    if (!activeRepo){
      console.log(`No repo found for repoId: ${id || query?.repoId}`)
      return;
    }

    const storage = getStorageFor("active-repo", activeRepo?.githubPath);

    if (storage.value) {
      dispatchRepoUpdates(storage.value.active, storage.value.permission);

      return;
    }

    getRepository(activeRepo?.githubPath, true)
      .then(info => {
        if (!info)
          return [];

        return Promise.all([
          Promise.resolve(info),
          getRepositoryBranches(activeRepo.githubPath),
          getRepositoryForks(activeRepo.githubPath),
          getRepositoryViewerPermission(activeRepo.githubPath)
        ])
      })
      .then(([info = undefined, branches = [], forks = [], permission]) => {
        const repoActive = {
          ghVisibility: !!info, 
          ...activeRepo, 
          ...info, 
          branches: branches.branches, 
          forks
        };

        storage.value = {
          active: repoActive,
          permission
        }

        dispatchRepoUpdates(repoActive, permission);
      })
      .catch(error => {
        console.error(`Failed to load repository`, error);
      })

  }

  return {loadRepos, updateActiveRepo};
}