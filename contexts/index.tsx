import React from 'react';
import ApplicationContextProvider from './application';
import { IssueProvider } from './issue';
import { ReposProvider } from './repos';
import { NetworkProvider } from './network';

const RootProviders: React.FC = ({children}) => {
  return (
    <ApplicationContextProvider>
      <NetworkProvider>
        <ReposProvider>
          <IssueProvider>
            {children}
          </IssueProvider>
        </ReposProvider>
      </NetworkProvider>
    </ApplicationContextProvider>
  )
}

export default RootProviders;