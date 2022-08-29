import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import Loading from "components/loading";

import { useSettings } from "contexts/settings";

import DAO from "services/dao-service";

export interface DAOContextData {
  service?: DAO;
  isStarting?: boolean;
  connect?: () => Promise<boolean>;
  changeNetwork?: (netwokAddress: string) => Promise<boolean>;
}

const DAOContext = createContext<DAOContextData>({});

export const DAOContextProvider = ({ children }) => {
  const [service, setService] = useState<DAO>();
  const [isStarting, setIsStarting] = useState(false);

  const { settings } = useSettings();

  const changeNetwork = useCallback(async (networkAddress: string): Promise<boolean> => {
    if (!service || !networkAddress) return false;

    setIsStarting(true);

    const loaded = await service.loadNetwork(networkAddress)
      .then(result => !!result)
      .catch(() => false)
      .finally(() => setIsStarting(false));

    if (loaded) window.DAOService = service;

    return loaded;
  }, [service, settings]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!service) return false;

    const connected = await service.connect();

    setService(service);

    return connected;
  }, [service, settings]);

  useEffect(() => {
    if (!!service || 
        !settings?.urls?.web3Provider || 
        !settings?.contracts?.network || 
        !settings?.contracts?.networkRegistry) return;

    setIsStarting(true);

    const daoService = new DAO({
      web3Host: settings.urls.web3Provider,
      registryAddress: settings.contracts.networkRegistry
    });

    daoService.start()
      .then(started => {
        if (started) return daoService.loadNetwork(settings.contracts.network);

        return started;
      })
      .then(started => {
        if (started) {
          window.DAOService = daoService;
          setService(daoService);

          console.table({
            Network_v2: settings?.contracts?.network,
            Settler: settings?.contracts?.settlerToken,
            Transactional: settings?.contracts?.transactionalToken,
            Network_Registry: settings?.contracts?.networkRegistry
          });
        }
        
      })
      .catch(console.log)
      .finally(() => {
        setIsStarting(false);
      });
  }, [service, settings]);

  const memorizedValue = useMemo<DAOContextData>(() => ({
    service,
    isStarting,
    connect,
    changeNetwork
  }), [service, isStarting, settings]);

  return(
    <DAOContext.Provider value={memorizedValue}>
      <Loading show={isStarting} />
      
      {children}
    </DAOContext.Provider>
  );
}

export const useDAO = (): DAOContextData => {
  const context = useContext(DAOContext);

  if (!context) {
    throw new Error("useDAO must be used within an DAOContextProvider");
  }

  return context;
};
