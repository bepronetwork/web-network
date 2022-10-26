import {useCallback, useContext, useEffect, useState} from "react";

import {useRouter} from "next/router";
import {UrlObject} from "url";

import { useAppState } from "contexts/app-state";
import {changeActiveNetwork, changeNetworkLastVisited} from "contexts/reducers/change-service";

import {WinStorage} from "services/win-storage";

import useApi from "./use-api";



export function useNetwork() {
  const {state, dispatch} = useAppState();
  const [storage,] = useState(new WinStorage(`lastNetworkVisited`, 0, 'localStorage'));
  const {query, push} = useRouter();
  const {getNetwork} = useApi();


  function clearNetworkFromStorage() {
    storage.delete();

    const networkName = state.Service?.network?.active?.name;
    if (networkName)
      new WinStorage(`bepro.network:${networkName}`, 0, `sessionStorage`).delete();
  }

  function updateActiveNetwork(forceUpdate = false) {
    const networkName =
      query?.network?.toString() ||
      state.Service?.network?.active?.name ||
      state.Settings?.defaultNetworkConfig?.name;

    if (!networkName || (storage.value && networkName && storage.value === networkName))
      return;

    console.debug(`Updating active network`, networkName);

    storage.value = networkName;
    dispatch(changeNetworkLastVisited(networkName));
    const storageParams = new WinStorage(`bepro.network:${networkName}`, 3600, `sessionStorage`);
    if (storageParams.value && !forceUpdate)
      return;

    console.debug(`Update active params`)

    getNetwork({name: networkName})
      .then(({data}) => {
        if (!data.isRegistered)
          throw new Error("Network not registered");

        storageParams.value = data;
        dispatch(changeActiveNetwork(data));

        console.debug(`Updated active params`, data);
      })
      .catch(error => {
        console.error(`Failed to get network`, error);
        push({pathname: `/networks`});
      });

  }

  function getURLWithNetwork(href: string, _query = undefined): UrlObject {
    return {
      pathname: `/[network]/${href}`.replace("//", "/"),
      query: {
        ..._query,
        network: _query?.network ||
          query?.network ||
          state.Settings?.defaultNetworkConfig?.name ||
          "bepro"
      }
    };
  }

  useEffect(updateActiveNetwork, [query?.network, state.Settings, state.Service]);

  return {
    updateActiveNetwork,
    getURLWithNetwork,
    clearNetworkFromStorage,
  }

}