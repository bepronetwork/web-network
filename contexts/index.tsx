import React from "react";

import ApplicationContextProvider from "contexts/application";
import { AuthenticationProvider } from "contexts/authentication";
import { IssueProvider } from "contexts/issue";
import { NetworkProvider } from "contexts/network";
import { ReposProvider } from "contexts/repos";

const RootProviders: React.FC = ({ children }) => {
  return (
    <AuthenticationProvider>
      <NetworkProvider>
        <ApplicationContextProvider>
          <ReposProvider>
            <IssueProvider>{children}</IssueProvider>
          </ReposProvider>
        </ApplicationContextProvider>
      </NetworkProvider>
    </AuthenticationProvider>
  );
};

export default RootProviders;
