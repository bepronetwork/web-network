import React from "react";

import CreateBountyModal from "components/create-bounty-modal";

import {AppStateContextProvider} from "./app-state";
import {DAOProvider} from "../x-hooks/use-dao";
import {NetworkProvider} from "../x-hooks/use-network";
import {AuthProvider} from "../x-hooks/use-authentication";

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
