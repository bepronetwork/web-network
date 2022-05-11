import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";


import getConfig from "next/config";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { INetwork } from "interfaces/network";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";

const { publicRuntimeConfig } = getConfig()
import { useAuthentication } from "./authentication";
export interface NetworkContextData {
  activeNetwork: INetwork;
  updateActiveNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

const cookieKey = "bepro.network";
const expiresCookie = 60 * 60 * 1; // 1 hour

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<INetwork>(null);

  const { getNetwork } = useApi();
  const { query, push } = useRouter();
  const { beproServiceStarted } = useAuthentication();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = query.network || publicRuntimeConfig?.networkConfig?.networkName;

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
  },
  [query, activeNetwork]);

  const updateNetworkParameters = useCallback(() => {
    if (!beproServiceStarted || activeNetwork?.councilAmount) return;

    Promise.all([
      BeproService.getNetworkParameter("councilAmount"),
      BeproService.getNetworkParameter("disputableTime"),
      BeproService.getNetworkParameter("draftTime"),
      BeproService.getNetworkParameter("oracleExchangeRate"),
      BeproService.getNetworkParameter("mergeCreatorFeeShare"),
      BeproService.getNetworkParameter("percentageNeededForDispute")
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
  }, [activeNetwork, beproServiceStarted]);

  useEffect(() => {
    updateActiveNetwork();
  }, [query]);

  useEffect(() => {
    if (query?.network) updateNetworkParameters();
  }, [beproServiceStarted, query?.network]);

  const memorizeValue = useMemo<NetworkContextData>(() => ({
      activeNetwork,
      updateActiveNetwork,
      updateNetworkParameters
  }),
    [activeNetwork]);

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
