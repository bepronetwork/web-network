import React from 'react';
import ApplicationContextProvider from './application';
import { IssueProvider } from './issue';
import { ReposProvider } from './repos';

const RootProviders: React.FC = ({children}) => {
  return (
    <ApplicationContextProvider>
      <ReposProvider>
        <IssueProvider>
          {children}
        </IssueProvider>
      </ReposProvider>
    </ApplicationContextProvider>
  )
}

export default RootProviders;