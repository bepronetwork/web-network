import '../styles/styles.scss'
import {AppProps} from 'next/app'
import React from 'react';
import WebThreeDialog from '@components/web3-dialog';
import Head from 'next/head'
import MainNav from '@components/main-nav';
import ApplicationContextProvider from '@contexts/application';

export default function App({Component, pageProps}: AppProps) {
  return (<>
    <ApplicationContextProvider>
      <Head> <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <title>WEB Network</title>
        </Head>
      <MainNav/>
      <WebThreeDialog />
      <Component {...pageProps} />
    </ApplicationContextProvider>
  </>)
}
