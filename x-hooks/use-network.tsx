import {useState} from "react";

import {useRouter} from "next/router";
import {UrlObject} from "url";

import {useAppState} from "contexts/app-state";
import {
  changeActiveNetwork,
  changeActiveNetworkAmounts,
  changeActiveNetworkTimes,
  changeActiveNetworkToken, 
  changeAllowedTokens,
  changeNetworkLastVisited
} from "contexts/reducers/change-service";

import {WinStorage} from "services/win-storage";

import useApi from "x-hooks/use-api";

const URLS_WITHOUT_NETWORK = ["/connect-account", "/networks", "/new-network", "/setup"];

export function useNetwork() {
  const {state, dispatch} = useAppState();
  const [storage,] = useState(new WinStorage(`lastNetworkVisited`, 0, 'localStorage'));

  const {getNetwork, getNetworkTokens} = useApi();
  const {pathname, query, push, replace} = useRouter();

  function clearNetworkFromStorage() {
    storage.delete();

    const networkName = state.Service?.network?.active?.name;
    if (networkName)
      new WinStorage(`bepro.network:${networkName}`, 0, `sessionStorage`).delete();
  }

  function updateActiveNetwork(forceUpdate = false) {
    const networkName = query?.network?.toString();

    if (networkName) {
      dispatch(changeNetworkLastVisited(networkName));
      storage.value = networkName;

      if (!forceUpdate) {
        const cachedNetworkData = new WinStorage(`bepro.network:${networkName}`, 0, `sessionStorage`);

        if (storage.value === networkName) {
          if (cachedNetworkData.value) {
            dispatch(changeActiveNetwork(cachedNetworkData.value));

            return;
          }
        } else 
          storage.value = networkName;
      }
    } else if (storage.value) dispatch(changeNetworkLastVisited(storage.value));

    console.debug(`Updating active network`, networkName);

    getNetwork({
      ... networkName && {
        name: networkName
      } || {
        isDefault: true
      }
    })
      .then(({data}) => {
        if (!data.isRegistered)
          throw new Error("Network not registered");

        const key = networkName || data?.name;

        const storageParams = new WinStorage(`bepro.network:${key}`, 3600, `sessionStorage`);

        storageParams.value = data;
        dispatch(changeActiveNetwork(data));
        
        console.debug(`Updated active params`, data);
      })
      .catch(error => {
        console.error(`Failed to get network`, error);

        if (!networkName && !URLS_WITHOUT_NETWORK.includes(pathname))
          replace("/setup");
        
        if(networkName)
          push({pathname: `/networks`});
      });

  }

  function getURLWithNetwork(href: string, _query = undefined): UrlObject {
    const _network = _query?.network ? String(_query?.network)?.replaceAll(" ", "-") : undefined;

    return {
      pathname: `/[network]/${href}`.replace("//", "/"),
      query: {
        ..._query,
        network: _network ||
          query?.network ||
          state?.Service?.network?.active?.name
      }
    };
  }

  function loadNetworkToken() {
    if (!state.Service?.active?.network || state.Service?.network?.networkToken)
      return;

    const activeNetworkToken: any = state.Service?.active?.network?.networkToken;

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

    getNetworkTokens({networkName: state?.Service?.network?.active?.name}).then(tokens => {
      const transactional = [];
      const reward = [];

      for (const token of tokens)
        (token.isTransactional ? transactional : reward).push(token);

      dispatch(changeAllowedTokens(transactional, reward));
    })
  }

  function loadNetworkTimes() {
    if (!state?.Service?.active?.network)
      return;

    const network: any = state.Service.active?.network;

    Promise.all([network.draftTime(), network.disputableTime()])
      .then(([draftTime, disputableTime]) => {
        dispatch(changeActiveNetworkTimes({
          draftTime: +draftTime / 1000, 
          disputableTime: +disputableTime / 1000
        }));
      })
  }

  function loadNetworkAmounts() {
    if (!state?.Service?.active?.network)
      return;

    const network: any = state.Service.active?.network;

    Promise.all([
        network.councilAmount(),
        network.mergeCreatorFeeShare(),
        network.proposerFeeShare(),
        network.percentageNeededForDispute(),
        network.oracleExchangeRate(),
        network.treasuryInfo()
    ])
      .then(([councilAmount, 
              mergeCreatorFeeShare, 
              proposerFeeShare, 
              percentageNeededForDispute, 
              oracleExchangeRate, treasury]) => {
        dispatch(changeActiveNetworkAmounts({
          councilAmount: councilAmount.toString(),
          oracleExchangeRate: +oracleExchangeRate,
          mergeCreatorFeeShare: +mergeCreatorFeeShare,
          proposerFeeShare: +proposerFeeShare,
          percentageNeededForDispute: +percentageNeededForDispute,
          treasury
        }));
      })
  }

  return {
    updateActiveNetwork,
    getURLWithNetwork,
    clearNetworkFromStorage,
    loadNetworkToken,
    loadNetworkTimes,
    loadNetworkAmounts,
    loadNetworkAllowedTokens
  }

}