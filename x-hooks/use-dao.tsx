import {isZeroAddress} from "ethereumjs-util";
import { useSession } from "next-auth/react";
import {useRouter} from "next/router";
import {isAddress} from "web3-utils";

import {useAppState} from "contexts/app-state";
import {changeChain as changeChainReducer} from "contexts/reducers/change-chain";
import {changeActiveDAO, changeStarting} from "contexts/reducers/change-service";
import {changeChangingChain, changeConnecting} from "contexts/reducers/change-spinners";

import {SUPPORT_LINK, UNSUPPORTED_CHAIN} from "helpers/constants";
import { lowerCaseCompare } from "helpers/string";

import {SupportedChainData} from "interfaces/supported-chain-data";

import DAO from "services/dao-service";

import useChain from "x-hooks/use-chain";
import useNetworkChange from "x-hooks/use-network-change";

export function useDao() {
  const session = useSession();
  const { replace, asPath, pathname } = useRouter();

  const { state, dispatch } = useAppState();
  const { findSupportedChain } = useChain();
  const { handleAddNetwork } = useNetworkChange();

  function isChainConfigured(chain: SupportedChainData) {
    return isAddress(chain?.registryAddress) && !isZeroAddress(chain?.registryAddress);
  }

  function isServiceReady() {
    return !state.Service?.starting && !state.spinners?.switchingChain;
  }

  /**
   * Enables the user/dapp to connect to the active DAOService
   */
  function connect(): Promise<string | null> {
    if (!state.Service?.web3Connection) return;

    dispatch(changeConnecting(true));

    return state.Service?.web3Connection?.connect()
      .then((connected) => {
        if (!connected) {
          console.debug(`Failed to connect`, state.Service);

          return "0x00";
        }

        return state.Service?.web3Connection?.getAddress();
      })
      .then(address => {
        if (address === "0x00") return null;

        return address;
      })
      .catch(error => {
        console.debug(`Failed to connect`, error);
        return null;
      })
      .finally(() => {
        dispatch(changeConnecting(false));
      });
  }

  /**
   * Change network to a known address if not the same
   * @param networkAddress
   */
  async function changeNetwork(chainId = '', address = '') {
    const networkAddress = address || state.Service?.network?.active?.networkAddress;
    const chain_id = +(chainId || state.Service?.network?.active?.chain_id);

    if (!state.Service?.active ||
        !networkAddress ||
        !chain_id ||
        state.spinners.switchingChain ||
        state.Service?.starting)
      return;

    if (state.Service?.active?.network?.contractAddress === networkAddress)
      return;

    const networkChain = findSupportedChain({ chainId: chain_id });

    if (!networkChain) return;

    const withWeb3Host = !!state.Service?.active?.web3Host;

    if (!withWeb3Host && chain_id !== +state.Service?.web3Connection?.web3?.currentProvider?.chainId ||
        withWeb3Host && networkChain.chainRpc !== state.Service?.active?.web3Host)
      return;

    console.debug("Starting network");

    dispatch(changeStarting(true));

    return state.Service.active
        .loadNetwork(networkAddress)
        .then(started => {
          if (!started) {
            console.error("Failed to load network", networkAddress);
            return;
          }
          // dispatch(changeActiveDAO(service));
          console.debug("Network started");
        })
        .catch(error => {
          console.error("Error loading network", error);
        })
        .finally(() => {
          dispatch(changeStarting(false));
        });
  }

  /**
   * Starts DAOService
   * dispatches changeNetwork() to active network
   */
  async function start() {
    if (session.status === "loading" ||
        session.status === "authenticated" && !state.currentUser?.connected) {
      console.debug("Session not loaded yet");
      return;
    }

    const supportedChains = state.supportedChains;

    if (!supportedChains?.length) {
      console.debug("No supported chains found");
      return;
    }

    const networkChainId = state.Service?.network?.active?.chain_id;
    const isOnNetwork = pathname?.includes("[network]");

    if (isOnNetwork && !networkChainId) {
      console.debug("Is on network, but network data was not loaded yet");
      return;
    }

    const { connectedChain } = state;

    const activeNetworkChainId = state.Service?.network?.active?.chain_id;

    const chainIdToConnect = isOnNetwork && activeNetworkChainId ? activeNetworkChainId : 
      (connectedChain?.name === UNSUPPORTED_CHAIN ? undefined : connectedChain?.id);

    const chainToConnect = supportedChains.find(({ isDefault, chainId }) => 
      chainIdToConnect ? +chainIdToConnect === +chainId : isDefault);

    if (!chainToConnect) {
      console.debug("No default or network chain found");
      return;
    }

    const isConfigured = isChainConfigured(chainToConnect);

    if (!isConfigured) {
      console.debug("Chain not configured", chainToConnect);

      if (state.currentUser?.isAdmin && !asPath.includes("setup") && !asPath.includes("connect-account")) {
        replace("/setup");

        return;
      }
    }

    const web3Connection = state.Service?.web3Connection;
    const isConnected = !!web3Connection?.web3?.currentProvider?._state?.isConnected;
    const shouldUseWeb3Connection = +chainIdToConnect === +connectedChain.id && isConnected;

    const isSameWeb3Host = 
      chainToConnect.chainRpc === state.Service?.active?.web3Host && !shouldUseWeb3Connection || 
      shouldUseWeb3Connection && !state.Service?.active?.web3Host;
    const isSameRegistry = lowerCaseCompare(chainToConnect?.registryAddress, state.Service?.active?.registryAddress);

    if (isSameWeb3Host && isSameRegistry && !isConnected) {
      console.debug("Already connected to this web3Host or the service is still starting");
      return;
    }

    console.debug("Starting DAOService");

    dispatch(changeStarting(true));

    const { chainRpc: web3Host, registryAddress: _registry } = chainToConnect;

    const registryAddress = isConfigured ? _registry : undefined;

    const daoProps = shouldUseWeb3Connection ? { web3Connection, registryAddress } : { web3Host, registryAddress };

    const daoService = new DAO(daoProps);

    if (!shouldUseWeb3Connection)
      await daoService.start()
        .catch(error => {
          console.debug("Error starting daoService", error);
        });

    if (registryAddress)
      await daoService.loadRegistry()
        .catch(error => console.debug("Failed to load registry", error));

    console.debug("DAOService started", daoProps);

    window.DAOService = daoService;
    dispatch(changeStarting(false));
    dispatch(changeActiveDAO(daoService));
  }

  function changeChain() {
    if (state.connectedChain?.matchWithNetworkChain !== false || 
        !state.currentUser?.walletAddress || 
        state.spinners?.changingChain) 
      return;

    dispatch(changeChangingChain(true));

    const networkChain = state.Service?.network?.active?.chain;

    if (networkChain)
      handleAddNetwork(networkChain)
        .catch(console.debug)
        .finally(() => dispatch(changeChangingChain(false)));
  }

  function dispatchChainUpdate(chainId: number) {
    const chain = findSupportedChain({ chainId });

    sessionStorage.setItem("currentChainId", chainId.toString());

    return dispatch(changeChainReducer.update({
      id: (chain?.chainId || chainId)?.toString(),
      name: chain?.chainName || UNSUPPORTED_CHAIN,
      shortName: chain?.chainShortName?.toLowerCase() || UNSUPPORTED_CHAIN,
      explorer: chain?.blockScanner || SUPPORT_LINK,
      events: chain?.eventsApi,
      registry: chain?.registryAddress
    }));
  }

  function listenChainChanged() {
    if (!window.ethereum || !state.supportedChains?.length)
      return;

    window.ethereum.removeAllListeners(`chainChanged`);

    if (window.ethereum.isConnected())
      dispatchChainUpdate(+window.ethereum.chainId);

    window.ethereum.on(`connected`, evt => {
      console.debug(`Metamask connected`, evt);
    });

    window.ethereum.on(`chainChanged`, evt => {
      dispatchChainUpdate(+evt);
    });
  }

  return {
    changeNetwork,
    changeChain,
    connect,
    start,
    isServiceReady,
    listenChainChanged
  };
}