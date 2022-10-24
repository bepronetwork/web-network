import React from "react";

import CreateBountyModal from "components/create-bounty-modal";

import ApplicationContextProvider from "contexts/application";
import { AuthenticationProvider } from "contexts/authentication";
import { DAOContextProvider } from "contexts/dao";
import { IssueProvider } from "contexts/issue";
import { NetworkProvider } from "contexts/network";
import { ReposProvider } from "contexts/repos";
import { SettingsProvider } from "contexts/settings";

const RootProviders: React.FC = ({ children }) => {
  return (
    <SettingsProvider>
      <DAOContextProvider>
        <NetworkProvider>
          <AuthenticationProvider>
              <ApplicationContextProvider>
                <ReposProvider>
                  <IssueProvider>
                    <CreateBountyModal />
                    {children}
                  </IssueProvider>
                </ReposProvider>
              </ApplicationContextProvider>
          </AuthenticationProvider>
        </NetworkProvider>
      </DAOContextProvider>
    </SettingsProvider>
  );
};

export default RootProviders;
