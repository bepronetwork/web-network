import {useCallback, useContext, useEffect, useMemo} from "react";
import {AppStateContext} from "../contexts/app-state";
import {changeActiveDAO, changeStarting} from "../contexts/reducers/change-service";
import DAO from "../services/dao-service";
import {toastError, toastSuccess} from "../contexts/reducers/change-toaster";

export function useDao() {
  const {state, dispatch} = useContext(AppStateContext);

  function connect() {
    if (!state.Service?.active)
      return;

    state.Service.active
      .connect()
      .then(connected => {
        if (!connected) {
          dispatch(toastError('Failed to connect'));
          console.log(`Failed to connect`, connected, state.Service);
        }

        dispatch(changeActiveDAO(state.Service.active));
      });
  }

  function changeNetwork(networkAddress: string) {
      if (!state.Service || !state.Service?.active || !networkAddress)
        return;

      if (state.Service.network.active.networkAddress === networkAddress)
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

          window.DAOService = service;
          dispatch(changeActiveDAO(service));
        })
        .catch(error => {
          console.error(`Error loading network`, error);
        })
        .finally(() => {
          dispatch(changeStarting(false));
        });
    }

  function start() {
    if (!state.Settings || state.Service)
      return;

    console.debug(`useDao start`);

    dispatch(changeStarting(true));

    const {urls: {web3Provider: web3Host}, contracts: {networkRegistry: registryAddress}} =
      state.Settings;

    const daoService = new DAO({web3Host, registryAddress});

    daoService.start()
      .then(started => started ? changeNetwork(state.Settings.contracts.network) : false)
      .catch(error => {
        console.error(`Error starting daoService`, error);
      })
      .finally(() => {
        dispatch(changeStarting(false));
      })
  }

  useEffect(start, [state.Settings, state.Service])

  return {
    changeNetwork,
    connect,
  };
}