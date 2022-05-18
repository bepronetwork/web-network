import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";


import getConfig from "next/config";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { useAuthentication } from "contexts/authentication";

import { INetwork } from "interfaces/network";

import useApi from "x-hooks/use-api";

import { useDAO } from "./dao";

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
  const { beproServiceStarted } = useAuthentication();
  const { service: DAOService } = useDAO();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = query?.network || publicRuntimeConfig?.networkConfig?.networkName;

    if (!networkName)
      return;
    
    if (activeNetwork?.name === networkName && !forced) return activeNetwork;

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
    if (!DAOService || activeNetwork?.councilAmount) return;

    Promise.all([
      DAOService.getNetworkParameter("councilAmount"),
      DAOService.getNetworkParameter("disputableTime"),
      DAOService.getNetworkParameter("draftTime"),
      DAOService.getNetworkParameter("oracleExchangeRate"),
      DAOService.getNetworkParameter("mergeCreatorFeeShare"),
      DAOService.getNetworkParameter("percentageNeededForDispute")
    ]).then(values => {
      setActiveNetwork({
        ...activeNetwork,
        councilAmount: values[0],
        disputableTime: values[1] / 1000,
        draftTime: values[2] / 1000,
        oracleExchangeRate: values[3],
        mergeCreatorFeeShare: values[4],
        percentageNeededForDispute: values[5]
      });
    });
  }, [activeNetwork, DAOService]);

  useEffect(() => {
    updateActiveNetwork();
  }, [query]);

  useEffect(() => {
    if (query?.network) updateNetworkParameters();
  }, [DAOService, query?.network]);

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
