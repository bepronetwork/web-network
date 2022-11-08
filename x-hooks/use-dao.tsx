import {createContext, useContext, useEffect,} from "react";

import {useAppState} from "../contexts/app-state";
import {changeCurrentUserConnected} from "../contexts/reducers/change-current-user";
import {changeActiveDAO, changeActiveNetwork, changeStarting} from "../contexts/reducers/change-service";
import {toastError,} from "../contexts/reducers/change-toaster";
import DAO from "../services/dao-service";

/**
 * Populate `state.Settings` and instantiates a DAOService
 */
export const DAOContext = createContext({});
export const DAOProvider = ({children}) => <DAOContext.Provider value={{}} children={children}/>;

export function useDao() {
  if (!useContext(DAOContext))
    throw new Error(`useDao() must have provider`);

  const {state, dispatch} = useAppState();

  /**
   * Enables the user/dapp to connect to the active DAOService
   */
  function connect() {
    if (!state.Service?.active)
      return;

    state.Service.active
      .connect()
      .then((connected) => {
        if (!connected) {
          dispatch(toastError('Failed to connect'));
          console.log(`Failed to connect`, state.Service);
          return;
        }

        dispatch(changeCurrentUserConnected(true));
      });
  }

  /**
   * Change network to a known address if not the same
   * @param networkAddress
   */
  function changeNetwork(networkAddress: string) {
    if (!state.Service?.active || !networkAddress)
      return;

    if (state.Service?.network?.active?.networkAddress === networkAddress)
      return;

    const service = state.Service.active;

    dispatch(changeStarting(true));

    service
        .loadNetwork(networkAddress)
        .then(started => {
          if (!started) {
            console.log(`Failed to load network`, networkAddress);
            return;
          }
          // dispatch(changeActiveDAO(service));
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
    console.debug(`${new Date()} useDao start`, state.Settings, !state.Settings || !!state.Service?.active || !!state.Service?.starting, !!state.Service?.active, !!state.Service?.starting)
    if (!state.Settings || !!state.Service?.active || !!state.Service?.starting)
      return;

    dispatch(changeStarting(true));

    console.debug(`useDao starting`);

    const {urls: {web3Provider: web3Host}, contracts: {networkRegistry: registryAddress}} =
      state.Settings;

    const daoService = new DAO({web3Host, registryAddress});

    daoService.start()
      .then(started => {
        if (started) {
          return daoService.loadNetwork(state.Settings.contracts.network);
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
        console.log(`useDao start finished`);
      })
  }

  useEffect(start, [state.Settings]);

  return {
    changeNetwork,
    connect,
    start,
  };
}