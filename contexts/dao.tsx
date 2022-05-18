import { createContext, useContext, useEffect, useMemo, useState } from "react";

import Loading from "components/loading";

import DAO from "services/dao-service";

export interface DAOContextData {
  service?: DAO;
}

const DAOContext = createContext<DAOContextData>({});

export const DAOContextProvider = ({ children }) => {
  const [service, setService] = useState<DAO>();
  const [isStarting, setIsStarting] = useState(false);

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
    service
  }), [service]);

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
