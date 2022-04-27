import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from "react";


import getConfig from "next/config";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import { INetwork } from "interfaces/network";

import useApi from "x-hooks/use-api";

const { publicRuntimeConfig } = getConfig()
export interface NetworkContextData {
  activeNetwork: INetwork;
  updateActiveNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

const cookieKey = "bepro.network";
const expiresCookie = 60 * 60 * 1; // 1 hour

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<INetwork>(null);

  const { query, push } = useRouter();
  const { getNetwork } = useApi();

  const updateActiveNetwork = useCallback((forced?: boolean) => {
    const networkName = String(query.network || publicRuntimeConfig.networkConfig.networkName);
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
        .catch((error) => {
          push({
            pathname: "/networks"
          });
        });
  },
    [query, activeNetwork]);

  useEffect(() => {
    updateActiveNetwork();
  }, [query]);

  useEffect(() => {
    //console.warn('useNetwork',{activeNetwork})
  }, [activeNetwork]);

  const memorizeValue = useMemo<NetworkContextData>(() => ({
      activeNetwork,
      updateActiveNetwork
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
