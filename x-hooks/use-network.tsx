import {createContext, useContext, useEffect, useState} from "react";

import {useRouter} from "next/router";
import {UrlObject} from "url";

import {useAppState} from "contexts/app-state";
import {
  changeActiveNetwork,
  changeActiveNetworkTimes,
  changeActiveNetworkToken, changeAllowedTokens,
  changeNetworkLastVisited
} from "contexts/reducers/change-service";

import {WinStorage} from "services/win-storage";

import useApi from "./use-api";

export const NetworkContext = createContext({})
export const NetworkProvider = ({children}) => <NetworkContext.Provider value={{}} children={children} />

export function useNetwork() {
  if (!useContext(NetworkContext))
    throw new Error(`useNetwork() must have provider`);

  const {state, dispatch} = useAppState();
  const [storage,] = useState(new WinStorage(`lastNetworkVisited`, 0, 'localStorage'));
  const {query, push} = useRouter();
  const {getNetwork, getTokens} = useApi();


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

    dispatch(changeNetworkLastVisited(networkName));

    if (!networkName || (storage.value && networkName && storage.value === networkName))
      return;

    console.debug(`Updating active network`, networkName);

    storage.value = networkName;

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

  function loadNetworkToken() {
    if (!state.Service?.active || !state?.Service?.network?.active || state.Service?.network?.networkToken)
      return;

    const activeNetworkToken: any = state.Service.network?.active?.networkToken;

    Promise.all([activeNetworkToken.name(), activeNetworkToken.symbol(),])
      .then(([name, symbol]) => {
        dispatch(changeActiveNetworkToken({
          name,
          symbol,
          decimals: activeNetworkToken.decimals,
          address: activeNetworkToken.contractAddress
        }))
      });
  }

  function loadNetworkAllowedTokens() {
    if (!state.Service?.active || !state?.Service?.network?.active)
      return;

    getTokens().then(tokens => {
      const transactional = [];
      const reward = [];

      for (const token of tokens)
        (token.isTransactional ? transactional : reward).push(token);

      dispatch(changeAllowedTokens(transactional, reward));
    })
  }

  function loadNetworkTimes() {
    if (!state.Service?.active || !state?.Service?.network?.active)
      return;

    const network: any = state.Service.network.active;

    Promise.all([network.draftTime(), network.disputableTime()])
      .then(([draftTime, disputableTime]) => {
        dispatch(changeActiveNetworkTimes({draftTime, disputableTime}));
      })
  }

  useEffect(updateActiveNetwork, [query?.network, state.Settings, state.Service]);
  useEffect(loadNetworkToken, [state.Service?.active, state?.Service?.network?.active])
  useEffect(loadNetworkTimes, [state.Service?.active, state?.Service?.network?.active])
  useEffect(loadNetworkAllowedTokens, [state.Service?.active, state?.Service?.network?.active])


  return {
    updateActiveNetwork,
    getURLWithNetwork,
    clearNetworkFromStorage,
  }

}