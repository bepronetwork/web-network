import '../styles/styles.scss'
import {AppProps} from 'next/app'
import WebThreeDialog from '../components/web3-dialog';
import Head from 'next/head'

import MainNav from '../components/main-nav';
import React, {useContext, useEffect} from 'react';
import ApplicationContextProvider, {ApplicationContext} from '../contexts/application';
import Loading from '../components/loading';


export default function App({Component, pageProps}: AppProps) {
  const {state,} = useContext(ApplicationContext)

  return (<>
    <ApplicationContextProvider>
      <Loading show={state.loading.isLoading}>{state.loading.text}</Loading>
      <Head> <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <title>WEB Network</title>
        </Head>
      <MainNav/>
        <WebThreeDialog />
      <WebThreeDialog></WebThreeDialog>
      <Component {...pageProps} />
    </ApplicationContextProvider>
  </>)
}
