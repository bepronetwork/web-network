import React from "react";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import {AppStateContextProvider} from "./app-state";
import {GlobalEffectsProvider} from "./global-effects";

const RootProviders: React.FC = ({children}) => {
  return (

    <AppStateContextProvider>
      <GlobalEffectsProvider>
        <NetworkThemeInjector />
        {children}
      </GlobalEffectsProvider>
    </AppStateContextProvider>

  );
};

export default RootProviders;
