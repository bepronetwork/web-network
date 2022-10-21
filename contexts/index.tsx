import React from "react";

import CreateBountyModal from "components/create-bounty-modal";

import { IssueProvider } from "contexts/issue";
import { ReposProvider } from "contexts/repos";

import AppStateContextProvider from "./app-state";

const RootProviders: React.FC = ({ children }) => {
  return (

    <AppStateContextProvider>
      <ReposProvider>
        <IssueProvider>
          <CreateBountyModal/>
          {children}
        </IssueProvider>
      </ReposProvider>
    </AppStateContextProvider>

  );
};

export default RootProviders;
