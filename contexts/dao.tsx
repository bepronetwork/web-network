import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import Loading from "components/loading";

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

  const changeNetwork = useCallback(async (networkAddress: string): Promise<boolean> => {
    if (!service || !networkAddress) return false;

    setIsStarting(true);

    const loaded = await service.loadNetwork(networkAddress)
      .then(result => !!result)
      .catch(() => false)
      .finally(() => setIsStarting(false));

    return loaded;
  }, [service]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!service) return false;

    const connected = await service.connect();

    setService(service);

    return connected;
  }, [service]);

  useEffect(() => {
    setIsStarting(true);

    const daoService = new DAO();

    daoService.start()
      .then(started => {
        if (started) return daoService.loadNetwork();

        return started;
      })
      .then(started => {
        if (started) {
          (window as any).DAOService = daoService;
          setService(daoService);
        }
        
      })
      .catch(console.log)
      .finally(() => {
        setIsStarting(false);
      });
  }, []);

  useEffect(() => {
    if (!service) return;
    
    window?.ethereum?.on("accountsChanged", () => {
      service.connect();
    });
  }, [service]);

  const memorizedValue = useMemo<DAOContextData>(() => ({
    service,
    isStarting,
    connect,
    changeNetwork
  }), [service, isStarting]);

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
