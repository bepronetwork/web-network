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
  const [lastNetworkVisited, setLastNetworkVisited] = useState<string>();
  const [loading, setLoadingProp] = useState<boolean>(false);
  const [storageLastNetworkVisited,] = useState(new WinStorage('lastNetworkVisited', 60*1000, "localStorage"))

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
    if (!DAOService?.network?.contractAddress || !activeNetwork?.networkAddress) return;

    const divide = (value) => +value / 1000;
    const toString = (value) => value.toString();
    const toNumber = (value) => +value;
    const getParam = (param) => DAOService.getNetworkParameter(param);

    if (loading)
      return;

    let loadedPropCount = 0;
    setLoadingProp(true);

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
      .forEach(([action, transformer, key], index, array) =>
        action()
          .then(value => {
            loadedPropCount++;
            setActiveNetwork({...activeNetwork, [key]: transformer ? transformer(value) : value});
            if (loadedPropCount === array.length)
              setLoadingProp(false);
          }));

  }, [activeNetwork?.networkAddress, DAOService?.network?.contractAddress]);

  useEffect(() => {
    if (storageLastNetworkVisited.value === query?.network.toString())
      return;

    if (query?.network)
      storageLastNetworkVisited.value = query.network.toString();
    
    setLastNetworkVisited(storageLastNetworkVisited.value);
    
    updateActiveNetwork();
  }, [query?.network]);

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
      lastNetworkVisited,
      updateActiveNetwork,
      updateNetworkParameters
  }), [activeNetwork, lastNetworkVisited, DAOService]);

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
