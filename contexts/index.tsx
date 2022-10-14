import React from "react";

import CreateBountyModal from "components/create-bounty-modal";

import { AuthenticationProvider } from "contexts/authentication";
import { DAOContextProvider } from "contexts/dao";
import { IssueProvider } from "contexts/issue";
import { NetworkProvider } from "contexts/network";
import { ReposProvider } from "contexts/repos";
import { SettingsProvider } from "contexts/settings";
import AppStateContextProvider from "./app-state";

const RootProviders: React.FC = ({ children }) => {
  return (
    <SettingsProvider>
      <DAOContextProvider>
        <NetworkProvider>
          <AuthenticationProvider>
              <AppStateContextProvider>
                <ReposProvider>
                  <IssueProvider>
                    <CreateBountyModal />
                    {children}
                  </IssueProvider>
                </ReposProvider>
              </AppStateContextProvider>
          </AuthenticationProvider>
        </NetworkProvider>
      </DAOContextProvider>
    </SettingsProvider>
  );
};

export default RootProviders;
