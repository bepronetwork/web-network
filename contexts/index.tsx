import React from 'react';
import ApplicationContextProvider from './application';
import { IssueProvider } from './issue';
import { ReposProvider } from './repos';
import { NetworkProvider } from './network';

const RootProviders: React.FC = ({children}) => {
  return (
    <NetworkProvider>
      <ApplicationContextProvider>
        <ReposProvider>
          <IssueProvider>{children}</IssueProvider>
        </ReposProvider>
      </ApplicationContextProvider>
    </NetworkProvider>
  );
}

export default RootProviders;