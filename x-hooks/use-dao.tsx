import {useAppState} from "../contexts/app-state";
import {changeCurrentUserConnected} from "../contexts/reducers/change-current-user";
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
    if (!state.Service?.active)
      return;

    dispatch(changeConnecting(true))

    state.Service.active
      .connect()
      .then((connected) => {
        if (!connected) {
          dispatch(toastError('Failed to connect'));
          console.error(`Failed to connect`, state.Service);
          return;
        }

        dispatch(changeCurrentUserConnected(true));
        dispatch(changeConnecting(false))
      });
  }

  /**
   * Change network to a known address if not the same
   * @param networkAddress
   */
  function changeNetwork(networkAddress: string) {
    console.log(`state.Service?.active`, state.Service?.active);
    if (!state.Service?.active || !networkAddress)
      return;

    if (state.Service?.active?.network?.contractAddress === networkAddress)
      return;

    const service = state.Service.active;

    dispatch(changeStarting(true));

    state.Service.active
        .loadNetwork(networkAddress)
        .then(started => {
          console.log(`loadNetwork`, started, service);
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
    console.debug(`useDao() start`, !(!state.Settings?.urls || !!state.Service?.active || !!state.Service?.starting));
    if (!state.Settings?.urls || !!state.Service?.active || !!state.Service?.starting)
      return;

    dispatch(changeStarting(true));



    const {urls: {web3Provider: web3Host}, contracts: {networkRegistry: registryAddress}} =
      state.Settings;

    const daoService = new DAO({web3Host, registryAddress});

    daoService.start()
      .then(started => {
        if (started) {
          return daoService.loadNetwork(state.Service?.network?.active?.networkAddress);
        }

        return false;
      })
      .then(loaded => {
        if (loaded) {
          window.DAOService = daoService;
          dispatch(changeActiveDAO(daoService));
          //dispatch(changeActiveNetwork(loaded));
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