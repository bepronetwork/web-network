import React from "react";

import CreateBountyModal from "components/create-bounty-modal";

import ApplicationContextProvider from "contexts/application";
import { AuthenticationProvider } from "contexts/authentication";
import { DAOContextProvider } from "contexts/dao";
import { IssueProvider } from "contexts/issue";
import { NetworkProvider } from "contexts/network";
import { NetworkSettingsProvider } from "contexts/network-settings";
import { ReposProvider } from "contexts/repos";
import { SettingsProvider } from "contexts/settings";

const RootProviders: React.FC = ({ children }) => {
  return (
    <SettingsProvider>
      <DAOContextProvider>
        <NetworkProvider>
          <AuthenticationProvider>
            <NetworkSettingsProvider>
              <ApplicationContextProvider>
                <ReposProvider>
                  <IssueProvider>
                    <CreateBountyModal />
                    {children}
                  </IssueProvider>
                </ReposProvider>
              </ApplicationContextProvider>
            </NetworkSettingsProvider>
          </AuthenticationProvider>
        </NetworkProvider>
      </DAOContextProvider>
    </SettingsProvider>
  );
};

export default RootProviders;
