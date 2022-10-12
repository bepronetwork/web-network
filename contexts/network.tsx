import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";

import { useRouter } from "next/router";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { useDAO } from "contexts/dao";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

import { useSettings } from "./settings";
import {NetworkParameters} from "../types/dappkit";
import {WinStorage} from "../services/win-storage";
import {usePrevious} from "@restart/hooks";

export interface NetworkContextData {
  activeNetwork: Network;
  lastNetworkVisited?: string;
  updateActiveNetwork: (forced?: boolean) => void;
}

type ParamAction = [() => any, null | ((value) => any), string];


const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

export const cookieKey = "bepro.network";

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<Network>(null);

  const prevNetwork = usePrevious(activeNetwork);
  const { getNetwork } = useApi();
  const { settings } = useSettings();
  const { query, push } = useRouter();
  const { service: DAOService, changeNetwork } = useDAO();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = query?.network?.toString() || settings?.defaultNetworkConfig?.name;

    if (!networkName)
      return;
    
    if (activeNetwork?.name?.toLowerCase() === networkName.toLowerCase() && !forced) return activeNetwork;

    const networkFromStorage = sessionStorage.getItem(`${cookieKey}:${networkName}`);
    
    if (networkFromStorage && !forced) {
      return setActiveNetwork(networkFromStorage && JSON.parse(networkFromStorage) || undefined);
    }

    getNetwork({name: networkName})
        .then(({ data }) => {
          if (!data.isRegistered) throw new Error("Network not registered");
          
          sessionStorage.setItem(`${cookieKey}:${networkName.toLowerCase()}`, JSON.stringify(data));
          setActiveNetwork(data);
        })
        .catch(() => {
          push({
            pathname: "/networks"
          });
        });
  }, [query, activeNetwork]);

  const updateNetworkParameters = useCallback(() => {
    console.log(`updating network params start`, DAOService?.network, activeNetwork?.networkAddress, prevNetwork?.name);

    if (!DAOService?.network?.contractAddress || !activeNetwork?.networkAddress) return;
    const sessionParams = new WinStorage(`${cookieKey}:${activeNetwork.name}:params`, 20000, 'sessionStorage');
    if (sessionParams.value)
      return;

    const divide = (value) => +value / 1000;
    const toString = (value) => value.toString();
    const toNumber = (value) => +value;
    const getParam = (param) => DAOService.getNetworkParameter(param);

    console.log(`updating network params`);

    Promise.all(
        ([
          [() => getParam("councilAmount"), toString, "councilAmount"],
          [() => getParam("disputableTime"), divide, "disputableTime"],
          [() => getParam("draftTime"), divide, "draftTime"],
          [() => getParam("oracleExchangeRate"), toNumber, "oracleExchangeRate"],
          [() => getParam("mergeCreatorFeeShare"), toNumber, "mergeCreatorFeeShare"],
          [() => getParam("proposerFeeShare"), toNumber, "proposerFeeShare"],
          [() => getParam("percentageNeededForDispute"), toNumber, "percentageNeededForDispute"],
          [DAOService.getTreasury, null, "treasury"],
          [DAOService.getSettlerTokenData, null, "networkToken"],
        ] as ParamAction[])
          .map(([action, transformer, key]) => action().then(value => ({[key]: transformer(value)}))))
      .then(values => values.reduce((prev, curr) => ({...prev, ...curr}),{}))
      .then(values => {
        sessionParams.value = values;
        setActiveNetwork(values);
      })

  }, [activeNetwork?.networkAddress, DAOService?.network?.contractAddress]);

  useEffect(() => { updateActiveNetwork(); }, [query?.network]);

  useEffect(() => {
    if (activeNetwork?.isRegistered === false) push("/networks");
  }, [activeNetwork]);

  useEffect(() => {    
    if (DAOService?.network?.contractAddress !== activeNetwork?.networkAddress ||! activeNetwork?.draftTime) 
      changeNetwork(activeNetwork?.networkAddress)
        .then(loaded => {
          if (loaded) updateNetworkParameters();
        });
  }, [DAOService?.network?.contractAddress, activeNetwork?.networkAddress]);

  const memorizeValue = useMemo<NetworkContextData>(() => ({
      activeNetwork,
      prevNetwork,
      updateActiveNetwork,
      updateNetworkParameters
  }), [activeNetwork, prevNetwork, DAOService]);

  return (
    <NetworkContext.Provider value={memorizeValue}>
      <div
        className={`${(activeNetwork?.isClosed && "read-only-network") || ""}`}
      >
        <NetworkThemeInjector />
        {children}
      </div>
    </NetworkContext.Provider>
  );
};

export function useNetwork(): NetworkContextData {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetwork must be used within an NetworkProvider");
  }

  return context;
}
