import React, { useEffect } from "react";

import { useSession } from "next-auth/react";

import NetworkThemeInjector from "components/custom-network/network-theme-injector";

import {AppStateContextProvider} from "./app-state";
import {GlobalEffectsProvider} from "./global-effects";

const RootProviders = ({children}) => {
  const { update } = useSession();

  useEffect(() => {
    update();
  }, []);

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
