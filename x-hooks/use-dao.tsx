import {isZeroAddress} from "ethereumjs-util";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {isAddress} from "web3-utils";

import {useAppState} from "contexts/app-state";
import {changeCurrentUserConnected, changeCurrentUserWallet} from "contexts/reducers/change-current-user";
import {changeActiveDAO, changeStarting} from "contexts/reducers/change-service";
import {changeChangingChain, changeConnecting} from "contexts/reducers/change-spinners";
import {toastError,} from "contexts/reducers/change-toaster";

import { SupportedChainData } from "interfaces/supported-chain-data";

import DAO from "services/dao-service";

import useChain from "x-hooks/use-chain";
import useNetworkChange from "x-hooks/use-network-change";

export function useDao() {

  const {query, replace, asPath} = useRouter();
  const {publicRuntimeConfig} = getConfig();

  const { chain } = useChain();
  const {state, dispatch} = useAppState();
  const { handleAddNetwork } = useNetworkChange();

  function isChainConfigured(chain: SupportedChainData) {
    return isAddress(chain?.registryAddress) && !isZeroAddress(chain?.registryAddress);
  }

  /**
   * Enables the user/dapp to connect to the active DAOService
   */
  function connect() {
    dispatch(changeConnecting(true));

    (state.Service?.active ? state.Service.active.connect() : window.ethereum.request({method: 'eth_requestAccounts'}))
      .then((connected) => {
        if (!connected) {
          dispatch(toastError('Failed to connect'));
          console.error(`Failed to connect`, state.Service);
          return;
        }

        dispatch(changeCurrentUserConnected(true));
        dispatch(changeConnecting(false))
        dispatch(changeCurrentUserWallet(connected[0] as string));
      });
  }

  /**
   * Change network to a known address if not the same
   * @param networkAddress
   */
  function changeNetwork() {
    const { networkAddress, chain_id } = state.Service?.network?.active || {};
    
    if (!state.Service?.active || !networkAddress || !chain || state.spinners.switchingChain)
      return;

    if (state.Service?.active?.network?.contractAddress === networkAddress)
      return;

    const service = state.Service.active;

    if (+chain_id !== +chain.chainId || chain.chainRpc !== state.Service?.active?.web3Host)
      return;

    console.debug("Starting network");

    dispatch(changeStarting(true));

    state.Service.active
        .loadNetwork(networkAddress)
        .then(started => {
          if (!started) {
            console.error("Failed to load network", networkAddress);
            return;
          }
          dispatch(changeActiveDAO(service));
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
  function start() {
    const supportedChains = state.supportedChains;

    if (!supportedChains?.length) {
      console.debug("No supported chains found");
      return;
    }

    const activeNetwork = state.Service?.network?.active;
    const connectedChain = state.connectedChain;

    const chainToConnect = supportedChains.find(({ isDefault, chainId }) => 
      activeNetwork || connectedChain ? +(activeNetwork?.chain_id || connectedChain?.id) === +chainId : isDefault);

    if (!chainToConnect) {
      console.debug("No default or network chain found");
      return;
    }

    const isConfigured = isChainConfigured(chainToConnect);

    if (!isConfigured) {
      console.debug("Chain not configured", chainToConnect);

      if (publicRuntimeConfig.adminWallet === state.currentUser?.walletAddress && !asPath.includes("setup")) {
        replace("/setup");

        return;
      }
    }

    const isSameWeb3Host = chainToConnect.chainRpc === state.Service?.active?.web3Host;
    const isSameRegistry = 
      connectedChain?.registry?.toLowerCase() === state.Service?.active?.registryAddress?.toLowerCase();

    if (isSameWeb3Host && isSameRegistry || state.Service?.starting) {
      console.debug("Already connected to this web3Host or the service is still starting");
      return;
    }

    console.debug("Starting DAOService");

    dispatch(changeStarting(true));

    const { chainRpc: web3Host, registryAddress: _registry } = chainToConnect;

    const registryAddress = isConfigured ? _registry : undefined;

    const daoService = new DAO({ web3Host, registryAddress });

    daoService.start()
      .then(async started => {
        if (started) {
          if (registryAddress)
            await daoService.loadRegistry()
              .catch(error => console.debug("Failed to load registry", error));

          window.DAOService = daoService;
          dispatch(changeActiveDAO(daoService));
          console.debug("DAOService started");
        }
      })
      .catch(error => {
        console.error(`Error starting daoService`, error);
      })
      .finally(() => {
        dispatch(changeStarting(false));
      })
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

  return {
    changeNetwork,
    changeChain,
    connect,
    start,
  };
}