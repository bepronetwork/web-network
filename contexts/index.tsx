import React from 'react';
import ApplicationContextProvider from './application';
import { IssueProvider } from './issue';

const RootProviders: React.FC = ({children}) => {
  return (
    <ApplicationContextProvider>
      <IssueProvider>
        {children}
      </IssueProvider>
    </ApplicationContextProvider>
  )
}

export default RootProviders;