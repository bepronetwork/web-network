import { useRouter } from 'next/router';
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useLayoutEffect,
  useCallback,
  useEffect,
} from 'react';

import { BEPRO_NETWORK_NAME } from 'env'
import { ApplicationContext } from './application';
import useApi from 'x-hooks/use-api';
import { changeLoadState } from 'contexts/reducers/change-load-state';
import { INetwork } from 'interfaces/network';

export interface NetworkContextData {
  activeNetwork: INetwork;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

export const NetworkProvider: React.FC = function ({ children }) {
  const [activeNetwork, setActiveNetwork] = useState<INetwork>(null);
  const [networksList, setNetworkLists] = useState<INetwork>(null);
  
  const {query, push} = useRouter();
  const { getNetwork } = useApi()
  const { dispatch } = useContext(ApplicationContext)
  
  const updateActiveNetwork = useCallback(()=>{
    const newNetwork = String(query.network || BEPRO_NETWORK_NAME) 

    const networkFromStorage = localStorage.getItem(newNetwork)

    if (networkFromStorage) {
      return setActiveNetwork(JSON.parse(networkFromStorage))
    }

    if (!!networkFromStorage) dispatch(changeLoadState(true))
    getNetwork(newNetwork)
      .then(({ data }) => {
        localStorage.setItem(newNetwork.toLowerCase(), JSON.stringify(data))
        setActiveNetwork(data)
      })
      .catch(error => {
        if (!!networkFromStorage)
          push({
            pathname: '/networks'
          })
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
  },[query])


  useLayoutEffect(()=>{
    updateActiveNetwork();
  },[query])

  useEffect(()=>{
    console.warn('useNetwork',{activeNetwork})
  },[activeNetwork])

  const memorizeValue = useMemo<NetworkContextData>(
    () => ({
      activeNetwork,
    }),
    [activeNetwork]
  );

  return (
    <NetworkContext.Provider value={memorizeValue}>
      {children}
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
