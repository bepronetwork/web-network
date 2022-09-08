import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";

import { useRouter } from "next/router";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { useDAO } from "contexts/dao";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

import { useSettings } from "./settings";

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

  const { getNetwork } = useApi();
  const { settings } = useSettings();
  const { query, push } = useRouter();
  const { service: DAOService, changeNetwork } = useDAO();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = query?.network || settings?.defaultNetworkConfig?.name;

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
    
    Promise.all([
        DAOService.getNetworkParameter("councilAmount"),
        DAOService.getNetworkParameter("disputableTime"),
        DAOService.getNetworkParameter("draftTime"),
        DAOService.getNetworkParameter("oracleExchangeRate"),
        DAOService.getNetworkParameter("mergeCreatorFeeShare"),
        DAOService.getNetworkParameter("proposerFeeShare"),
        DAOService.getNetworkParameter("percentageNeededForDispute"),
        DAOService.getTreasury(),
        DAOService.getSettlerTokenData()
    ])
      .then(([councilAmount, 
              disputableTime, 
              draftTime, 
              oracleExchangeRate, 
              mergeCreatorFeeShare,
              proposerFeeShare,
              percentageNeededForDispute, 
              treasury,
              networkToken]) => {
        setActiveNetwork(prevNetwork => ({
          ...prevNetwork,
          councilAmount,
          disputableTime: disputableTime / 1000,
          draftTime: draftTime / 1000,
          oracleExchangeRate,
          mergeCreatorFeeShare,
          proposerFeeShare,
          percentageNeededForDispute,
          treasury,
          networkToken: {
            ...networkToken,
            symbol: `$${networkToken.symbol}`,
          }
        }));
      });
  }, [activeNetwork?.networkAddress, DAOService?.network?.contractAddress]);

  useEffect(() => {
    if (query?.network) 
      localStorage.setItem("lastNetworkVisited", query.network.toString());
    
    setLastNetworkVisited(localStorage.getItem("lastNetworkVisited"));
    
    updateActiveNetwork();
  }, [query?.network]);

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
