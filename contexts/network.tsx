import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";

import getConfig from "next/config";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { useDAO } from "contexts/dao";

import { handleNetworkAddress } from "helpers/custom-network";

import { INetwork } from "interfaces/network";

import useApi from "x-hooks/use-api";

const { publicRuntimeConfig } = getConfig();

export interface NetworkContextData {
  activeNetwork: INetwork;
  updateActiveNetwork: (forced?: boolean) => void;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

const cookieKey = "bepro.network";
const expiresCookie = 60 * 60 * 1; // 1 hour

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<INetwork>(null);

  const { getNetwork } = useApi();
  const { query, push } = useRouter();
  const { service: DAOService, changeNetwork } = useDAO();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = query?.network || publicRuntimeConfig?.networkConfig?.networkName;

    if (!networkName)
      return;
    
    if (activeNetwork?.name?.toLowerCase() === networkName.toLowerCase() && !forced) return activeNetwork;

    const networkFromStorage = parseCookies()[`${cookieKey}:${networkName}`];
    
    if (networkFromStorage && !forced) {
      return setActiveNetwork(JSON.parse(networkFromStorage));
    }

    getNetwork(networkName)
        .then(({ data }) => {
          localStorage.setItem(networkName.toLowerCase(), JSON.stringify(data));
          setCookie(null, `${cookieKey}:${networkName}`, JSON.stringify(data), {
            maxAge: expiresCookie, // 1 hour
            path: "/"
          });
          setActiveNetwork(data);
        })
        .catch(() => {
          push({
            pathname: "/networks"
          });
        });
  }, [query, activeNetwork]);

  const updateNetworkParameters = useCallback(() => {
    if (!DAOService || activeNetwork?.councilAmount || !activeNetwork?.networkAddress) return;

    
    Promise.all([
        DAOService.getNetworkParameter("councilAmount"),
        DAOService.getNetworkParameter("disputableTime"),
        DAOService.getNetworkParameter("draftTime"),
        DAOService.getNetworkParameter("oracleExchangeRate"),
        DAOService.getNetworkParameter("mergeCreatorFeeShare"),
        DAOService.getNetworkParameter("proposerFeeShare"),
        DAOService.getNetworkParameter("percentageNeededForDispute"),
        DAOService.getTreasury()
    ])
      .then(([councilAmount, 
              disputableTime, 
              draftTime, 
              oracleExchangeRate, 
              mergeCreatorFeeShare,
              proposerFeeShare,
              percentageNeededForDispute, 
              treasury]) => {
        setActiveNetwork({
          ...activeNetwork,
          councilAmount,
          disputableTime: disputableTime / 1000,
          draftTime: draftTime / 1000,
          oracleExchangeRate,
          mergeCreatorFeeShare,
          proposerFeeShare,
          percentageNeededForDispute,
          treasury
        });
      });
  }, [activeNetwork, DAOService]);

  useEffect(() => {
    updateActiveNetwork();
  }, [query?.network]);

  useEffect(() => {
    if (activeNetwork) updateNetworkParameters();
  }, [DAOService, activeNetwork]);

  useEffect(() => {
    if(activeNetwork?.networkAddress) changeNetwork(handleNetworkAddress(activeNetwork));
  }, [activeNetwork]);

  const memorizeValue = useMemo<NetworkContextData>(() => ({
      activeNetwork,
      updateActiveNetwork,
      updateNetworkParameters
  }),
    [activeNetwork, DAOService]);

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
