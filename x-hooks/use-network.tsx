import {useState} from "react";

import {useRouter} from "next/router";
import {UrlObject} from "url";

import {useAppState} from "contexts/app-state";
import { changeMatchWithNetworkChain } from "contexts/reducers/change-chain";
import {
  changeActiveNetwork,
  changeActiveNetworkAmounts,
  changeActiveNetworkTimes,
  changeAllowedTokens,
  changeNetworkLastVisited
} from "contexts/reducers/change-service";

import {WinStorage} from "services/win-storage";

import useApi from "x-hooks/use-api";

const URLS_WITHOUT_NETWORK = ["/connect-account", "/networks", "/new-network", "/setup"];

export function useNetwork() {
  const [storage,] = useState(new WinStorage(`lastNetworkVisited`, 0, 'localStorage'));
  
  const {query, replace} = useRouter();
  const {state, dispatch} = useAppState();
  const {getNetwork, getNetworkTokens} = useApi();

  function clearNetworkFromStorage() {
    storage.delete();

    const networkName = state.Service?.network?.active?.name;
    const chainId = state.connectedChain?.id;

    if (networkName)
      new WinStorage(`bepro.network:${networkName}:${chainId}`, 0, `sessionStorage`).delete();
  }

  function updateActiveNetwork(forceUpdate = false) {
    const queryNetworkName = query?.network?.toString();
    const queryChainName = query?.chain?.toString();

    if (queryNetworkName && queryChainName) {
      const chainId = state.connectedChain?.id;
      const storageKey = `bepro.network:${queryNetworkName}:${chainId}`;

      if (storage.value && storage.value !== queryNetworkName)
        storage.value = queryNetworkName;

      const cachedNetworkData = new WinStorage(storageKey, 3000, `sessionStorage`);
      if (forceUpdate === false && cachedNetworkData.value) {
        dispatch(changeActiveNetwork(cachedNetworkData.value));
        return;
      }

      getNetwork({name: queryNetworkName, chainName: queryChainName })
        .then(async ({data}) => {
          if (!data.isRegistered)
            return replace(`/networks`);

          const newCachedData = new WinStorage(storageKey, 3600, `sessionStorage`);
          newCachedData.value = data;

          dispatch(changeNetworkLastVisited(queryNetworkName));
          dispatch(changeActiveNetwork(newCachedData.value));
        })
        .catch(e => {
          console.log(`Failed to get network ${queryNetworkName}`, e);
          return replace(`/networks`);
        })
    }
  }

  function getURLWithNetwork(href: string, _query = undefined): UrlObject {
    const _network = _query?.network ? String(_query?.network)?.toLowerCase()?.replaceAll(" ", "-") : undefined;
    const cleanHref =  href.replace("/[network]/[chain]", "");

    return {
      pathname: `/[network]/[chain]/${cleanHref}`.replace("//", "/"),
      query: {
        ..._query,
        chain: _query?.chain || query?.chain,
        network: _network ||
          query?.network ||
          state?.Service?.network?.active?.name
      }
    };
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
        network.treasuryInfo(),
        network.totalNetworkToken()
    ])
      .then(([councilAmount, 
              mergeCreatorFeeShare, 
              proposerFeeShare, 
              percentageNeededForDispute, 
              oracleExchangeRate, 
              treasury,
              totalNetworkToken]) => {
        dispatch(changeActiveNetworkAmounts({
          councilAmount: councilAmount.toString(),
          oracleExchangeRate: +oracleExchangeRate,
          mergeCreatorFeeShare: +mergeCreatorFeeShare,
          proposerFeeShare: +proposerFeeShare,
          percentageNeededForDispute: +percentageNeededForDispute,
          treasury,
          totalNetworkToken
        }));
      })
  }

  function updateNetworkAndChainMatch() {
    const connectedChainId = state.connectedChain?.id;
    const networkChainId = state?.Service?.network?.active?.chain_id;
    const isOnANetwork = !!query?.network;

    if (connectedChainId && networkChainId && isOnANetwork)
      dispatch(changeMatchWithNetworkChain(+connectedChainId === +networkChainId));
    else
      dispatch(changeMatchWithNetworkChain(null));
  }

  return {
    updateActiveNetwork,
    getURLWithNetwork,
    clearNetworkFromStorage,
    loadNetworkTimes,
    loadNetworkAmounts,
    loadNetworkAllowedTokens,
    updateNetworkAndChainMatch
  }

}