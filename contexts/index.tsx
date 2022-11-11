import React from "react";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import {AuthProvider} from "../x-hooks/use-authentication";
import {DAOProvider} from "../x-hooks/use-dao";
import {NetworkProvider} from "../x-hooks/use-network";
import {AppStateContextProvider} from "./app-state";
import {GlobalEffectsProvider} from "./global-effects";

const RootProviders: React.FC = ({children}) => {
  return (

    <AppStateContextProvider>
      <GlobalEffectsProvider>
        <DAOProvider>
          <NetworkProvider>
            <NetworkThemeInjector />
            <AuthProvider>
              {children}
            </AuthProvider>
          </NetworkProvider>
        </DAOProvider>
      </GlobalEffectsProvider>
    </AppStateContextProvider>

  );
};

export default RootProviders;
