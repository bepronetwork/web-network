import {useCallback, useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {WinStorage} from "services/win-storage";
import {AppStateContext} from "contexts/app-state";
import useApi from "./use-api";
import {changeActiveNetwork, changeNetworkLastVisited} from "contexts/reducers/change-service";

export function useNetwork() {
  const {state, dispatch} = useContext(AppStateContext);
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

  useEffect(updateActiveNetwork, [query?.network, state.Settings, state.Service]);

  return {
    updateActiveNetwork,
    clearNetworkFromStorage,
  }

}