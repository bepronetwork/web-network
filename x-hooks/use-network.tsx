import {useEffect, useState} from "react";

import {useRouter} from "next/router";
import {UrlObject} from "url";

import {useAppState} from "contexts/app-state";
import {changeMatchWithNetworkChain} from "contexts/reducers/change-chain";
import {
  changeActiveAvailableChains,
  changeActiveNetwork,
  changeActiveNetworkAmounts,
  changeActiveNetworkTimes,
  changeAllowedTokens,
  changeNetworkLastVisited
} from "contexts/reducers/change-service";

import {ProfilePages} from "interfaces/utils";

import {WinStorage} from "services/win-storage";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";

export function useNetwork() {
  const {query, replace, push} = useRouter();

  const [networkName, setNetworkName] = useState<string>('');
  const [storage,] = useState(new WinStorage(`lastNetworkVisited`, 0, 'localStorage'));

  const {state, dispatch} = useAppState();
  const { chain, findSupportedChain } = useChain();
  const {searchNetworks, getNetworkTokens} = useApi();

  function getStorageKey(networkName: string, chainId: string | number) {
    return `bepro.network:${networkName}:${chainId}`;
  }

  function clearNetworkFromStorage() {
    storage.delete();

    const networkName = state.Service?.network?.active?.name;
    const chainId = state.connectedChain?.id;

    if (networkName)
      new WinStorage(getStorageKey(networkName, chainId), 0, `sessionStorage`).delete();
  }

  async function updateActiveNetwork(forceUpdate = false) {
    const queryNetworkName = query?.network?.toString();
    const queryChainName = query?.chain?.toString();

    if (!queryNetworkName) return;

    if (queryChainName) {
      const chain = findSupportedChain({ chainShortName: queryChainName });

      if (chain) {
        const storageKey = getStorageKey(queryNetworkName, chain.chainId);

        if (storage.value && storage.value !== queryNetworkName)
          storage.value = queryNetworkName;

        const cachedNetworkData = new WinStorage(storageKey, 3000, `sessionStorage`);
        if (forceUpdate === false && cachedNetworkData.value) {
          dispatch(changeActiveNetwork(cachedNetworkData.value));
          return;
        }
      }
    }

    await searchNetworks({
      name: queryNetworkName,
      isNeedCountsAndTokensLocked: true
    })
      .then(({count, rows}) => {
        if (count === 0) {
          throw new Error("No networks found");
        }

        if (queryChainName) {
          const data = rows.find((network) =>
              network?.chain?.chainShortName?.toLowerCase() ===
              queryChainName?.toLowerCase());

          if (!data.isRegistered) {
            if (state.currentUser?.walletAddress === data.creatorAddress)
              return replace(getURLWithNetwork("/profile/my-network", {
                network: data.name,
                chain: data.chain.chainShortName
              }));
            else
              throw new Error("Network not registered");
          }

          const newCachedData = new WinStorage(getStorageKey(data.name, data.chain.chainId), 3600, `sessionStorage`);
          newCachedData.value = data;

          dispatch(changeNetworkLastVisited(queryNetworkName));
          dispatch(changeActiveNetwork(newCachedData.value));
        }

        const available = rows
          .filter(({ isRegistered, isClosed }) => isRegistered && !isClosed)
          .map(network => network.chain);

        dispatch(changeActiveAvailableChains(available));
      })
      .catch(e => {
        console.log(`Failed to get network ${queryNetworkName}`, e);
        if(query?.id && query?.repoId) return;
        return replace(`/networks`);
      });
  }

  function getURLWithNetwork(href: string, _query = undefined): UrlObject {
    const _network = _query?.network ? String(_query?.network)?.toLowerCase()?.replaceAll(" ", "-") : undefined;
    const cleanHref =  href.replace("/[network]/[chain]", "");

    return {
      pathname: `/[network]/[chain]/${cleanHref}`.replace("//", "/"),
      query: {
        ..._query,
        chain: _query?.chain || query?.chain || state?.Service?.network?.active?.chain?.chainShortName,
        network: _network ||
          query?.network ||
          state?.Service?.network?.active?.name
      }
    };
  }

  function goToProfilePage(profilePage: ProfilePages, params = undefined) {
    const queryNetwork = query?.network || "";
    const queryChain = query?.chain || "";

    const path = profilePage === "profile" ? "profile" : `profile/${profilePage}`;

    if (queryNetwork !== "")
      return push(getURLWithNetwork(`/profile/[[...profilePage]]`, {
        ...query,
        ...params
      }), `/${queryNetwork}/${queryChain}/${path}`);

    return push({
      pathname: "/profile/[[...profilePage]]",
      query: {
        ...query,
        ...params
      }
    }, `/${path}`);
  }

  function loadNetworkAllowedTokens() {
    if (!state?.Service?.network?.active || !chain)
      return;

    getNetworkTokens({
      networkName: state?.Service?.network?.active?.name,
      chainId: chain.chainId.toString()
    }).then(tokens => {
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

    const network = state.Service.active?.network;

    Promise.all([network.draftTime(), network.disputableTime()])
      .then(([draftTime, disputableTime]) => {
        dispatch(changeActiveNetworkTimes({
          draftTime: +draftTime / 1000,
          disputableTime: +disputableTime / 1000
        }));
      })
      .catch(error => console.debug("Failed to loadNetworkTimes", error));
  }

  function loadNetworkAmounts() {
    if (!state?.Service?.active?.network)
      return;

    const network = state.Service.active?.network;

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
      .catch(error => console.debug("Failed to loadNetworkAmounts", error));
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

  useEffect(() => { setNetworkName(query?.network?.toString() || ''); }, [query?.network]);

  return {
    networkName,
    updateActiveNetwork,
    getURLWithNetwork,
    clearNetworkFromStorage,
    loadNetworkTimes,
    loadNetworkAmounts,
    loadNetworkAllowedTokens,
    goToProfilePage,
    updateNetworkAndChainMatch
  }

}