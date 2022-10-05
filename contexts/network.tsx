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

export interface NetworkContextData {
  activeNetwork: Network;
  lastNetworkVisited?: string;
  updateActiveNetwork: (forced?: boolean) => void;
}



const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

export const cookieKey = "bepro.network";

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<Network>(null);
  const [lastNetworkVisited, setLastNetworkVisited] = useState<string>();
  const [loading, setLoadingProp] = useState<{[p: string]: boolean}>({});

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

    const devide = (value) => +value / 1000;
    const toString = (value) => value.toString();
    const toNumber = (value) => +value;

    ([
      ["councilAmount", toString], ["disputableTime", devide], ["draftTime", devide],
      ["oracleExchangeRate", toNumber], ["mergeCreatorFeeShare", toNumber], ["proposerFeeShare", toNumber],
      ["percentageNeededForDispute", toNumber],
    ] as [NetworkParameters, (value) => any][]).forEach(([prop, action]) => {
      if (loading[prop])
        return;

      setLoadingProp({...loading, [prop]: true});
      DAOService.getNetworkParameter(prop)
        .then(value => {
          setActiveNetwork({...activeNetwork, [prop]: action(value)})
        })
        .finally(() => setLoadingProp({...loading, [prop]: false}))
    });

    if (!loading.treasury) {
      setLoadingProp({...loading, treasury: true});
      DAOService
        .getTreasury()
        .then(value => setActiveNetwork({...activeNetwork, treasury: value}))
        .finally(() => setLoadingProp({...loading, treasury: false}))
    }

    if (!loading.networkToken) {
      setLoadingProp({...loading, networkToken: true});
      DAOService
        .getSettlerTokenData()
        .then(value => setActiveNetwork({...activeNetwork, networkToken: value}))
        .finally(() => setLoadingProp({...loading, networkToken: false}))
    }

  }, [activeNetwork?.networkAddress, DAOService?.network?.contractAddress]);

  useEffect(() => {
    if (query?.network) 
      localStorage.setItem("lastNetworkVisited", query.network.toString());
    
    setLastNetworkVisited(localStorage.getItem("lastNetworkVisited"));
    
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
