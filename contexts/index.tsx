import React from 'react';

import ApplicationContextProvider from '@contexts/application';

import { IssueProvider } from '@contexts/issue';
import { ReposProvider } from '@contexts/repos';
import { NetworkProvider } from '@contexts/network';
import { AuthenticationProvider } from '@contexts/authentication';

const RootProviders: React.FC = ({children}) => {
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
}

export default RootProviders;