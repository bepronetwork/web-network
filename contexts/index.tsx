import React from "react";

import CreateBountyModal from "components/create-bounty-modal";
import AppStateContextProvider from "./app-state";

const RootProviders: React.FC = ({ children }) => {
  return (

    <AppStateContextProvider>
      <CreateBountyModal/>
      {children}
    </AppStateContextProvider>

  );
};

export default RootProviders;
