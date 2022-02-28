import { useRouter } from 'next/router';
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

import { BEPRO_NETWORK_NAME } from 'env'
import useApi from 'x-hooks/use-api';
import { INetwork } from 'interfaces/network';
import NetworkThemeInjector from 'components/custom-network/network-theme-injector';

export interface NetworkContextData {
  activeNetwork: INetwork;
  updateActiveNetwork: ()=> void;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<INetwork>(null);

  const {query, push} = useRouter();
  const { getNetwork } = useApi()
  
  const updateActiveNetwork = useCallback(()=>{
    const newNetwork = String(query.network || BEPRO_NETWORK_NAME) 
    if(activeNetwork?.name === newNetwork) return activeNetwork;

    const networkFromStorage = localStorage.getItem(newNetwork)

    if (networkFromStorage) {
      return setActiveNetwork(JSON.parse(networkFromStorage))
    }
    
    getNetwork(newNetwork)
      .then(({ data }) => {
        localStorage.setItem(newNetwork.toLowerCase(), JSON.stringify(data))
        setActiveNetwork(data)
      })
      .catch(error => {
          push({
            pathname: '/networks'
          })
      })
  },[query, activeNetwork])


  useEffect(()=>{
    updateActiveNetwork();
  },[query])

  useEffect(()=>{
    console.warn('useNetwork',{activeNetwork})
  },[activeNetwork])

  const memorizeValue = useMemo<NetworkContextData>(
    () => ({
      activeNetwork,
      updateActiveNetwork
    }),
    [activeNetwork]
  );

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
    throw new Error('useNetwork must be used within an NetworkProvider');
  }

  return context;
}
