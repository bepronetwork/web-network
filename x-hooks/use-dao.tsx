import {isZeroAddress} from "ethereumjs-util";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {isAddress} from "web3-utils";

import {useAppState} from "../contexts/app-state";
import {changeCurrentUserConnected, changeCurrentUserWallet} from "../contexts/reducers/change-current-user";
import {changeActiveDAO, changeStarting} from "../contexts/reducers/change-service";
import {changeConnecting} from "../contexts/reducers/change-spinners";
import {toastError,} from "../contexts/reducers/change-toaster";
import DAO from "../services/dao-service";


export function useDao() {

  const {state, dispatch} = useAppState();
  const {publicRuntimeConfig} = getConfig();
  const {replace, asPath} = useRouter();

  /**
   * Enables the user/dapp to connect to the active DAOService
   */
  function connect() {
    // if (!state.Service?.active)
    //   return;

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
    const networkAddress = state.Service?.network?.active?.networkAddress;

    console.log({
      networkAddress,
      activeService: state.Service?.active,
      loadedNetwork: state.Service?.active?.network?.contractAddress,
      connectedChain: state?.connectedChain,
      networkChainId: state.Service?.network?.active
    });
    
    if (!state.Service?.active || !networkAddress)
      return;

    if (state.Service?.active?.network?.contractAddress === networkAddress)
      return;

    if (+state.Service?.network?.active?.chain_id !== +state?.connectedChain?.id)
      return;

    const service = state.Service.active;

    console.debug("starting network")

    dispatch(changeStarting(true));

    state.Service.active
        .loadNetwork(networkAddress)
        .then(started => {
          if (!started) {
            console.error(`Failed to load network`, networkAddress);
            return;
          }
          dispatch(changeActiveDAO(service));
        })
        .catch(error => {
          console.error(`Error loading network`, error);
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
    const connectedChain = state.supportedChains?.find(({chainId}) => +state?.connectedChain?.id === chainId);
    const activeWeb3Host = state.Service?.active?.web3Host;
    const hostsDiffer = connectedChain?.chainRpc !== activeWeb3Host;
    const hasChainRpc = !!connectedChain?.chainRpc;
    const hasChainRegistry = 
      isAddress(connectedChain?.registryAddress) && !isZeroAddress(connectedChain?.registryAddress);

    if (!connectedChain)
      return;

    if (!hasChainRpc || !hasChainRegistry) {
      console.debug(`Chain not configured`, connectedChain);
      if (publicRuntimeConfig.adminWallet === state.currentUser?.walletAddress && !asPath.includes(`setup`))
        replace(`/setup`).then(_ => {});
    }

    if (!hostsDiffer || state.Service?.starting)
      return;

    dispatch(changeStarting(true));

    const {chainRpc: web3Host, registryAddress} = (connectedChain);
    
    let web3Connection = undefined;

    if (state.Service?.active) {
      web3Connection = state.Service.active.web3Connection;
      web3Connection.options.web3Host = web3Host;
    }

    const daoService = new DAO({web3Connection, web3Host, ... hasChainRegistry ? {registryAddress} : {}});

    console.log('web3Host',daoService?.web3Host);

    daoService.start()
      .then(started => {
        if (started) {
          window.DAOService = daoService;
          dispatch(changeActiveDAO(daoService));
        }
      })
      .catch(error => {
        console.error(`Error starting daoService`, error);
      })
      .finally(() => {
        dispatch(changeStarting(false));
      })
  }


  return {
    changeNetwork,
    connect,
    start,
  };
}