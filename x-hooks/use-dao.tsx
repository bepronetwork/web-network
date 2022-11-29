import {useAppState} from "../contexts/app-state";
import {changeCurrentUserConnected, changeCurrentUserWallet} from "../contexts/reducers/change-current-user";
import {changeActiveDAO, changeStarting} from "../contexts/reducers/change-service";
import {changeConnecting} from "../contexts/reducers/change-spinners";
import {toastError,} from "../contexts/reducers/change-toaster";
import DAO from "../services/dao-service";


export function useDao() {

  const {state, dispatch} = useAppState();

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

        if (!state?.Service?.active)
          dispatch(changeCurrentUserWallet(connected[0] as string));
      });
  }

  /**
   * Change network to a known address if not the same
   * @param networkAddress
   */
  function changeNetwork() {
    const networkAddress = state.Service?.network?.active?.networkAddress;
    
    if (!state.Service?.active || !networkAddress)
      return;

    if (state.Service?.active?.network?.contractAddress === networkAddress)
      return;

    const service = state.Service.active;

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
    const defaultChain = state.supportedChains.find(({isDefault}) => isDefault);
    const connectedChain = state.supportedChains.find(({chainId}) => +state?.connectedChain?.id === chainId);
    const activeWeb3Host = state.Service?.active?.web3Host;

    if (!(connectedChain || defaultChain) || (activeWeb3Host && activeWeb3Host === connectedChain?.chainRpc) || state.Service?.starting)
      return;

    dispatch(changeStarting(true));

    const {chainRpc: web3Host, networkRegistry: registryAddress} = (connectedChain || defaultChain);
    const daoService = new DAO({web3Host, registryAddress});

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