import React from "react";

import {AuthProvider} from "../x-hooks/use-authentication";
import {DAOProvider} from "../x-hooks/use-dao";
import {NetworkProvider} from "../x-hooks/use-network";
import {AppStateContextProvider} from "./app-state";

const RootProviders: React.FC = ({children}) => {
  return (

    <AppStateContextProvider>
      <DAOProvider>
        <NetworkProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NetworkProvider>
      </DAOProvider>
    </AppStateContextProvider>

  );
};

export default RootProviders;
