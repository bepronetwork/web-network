import "../styles/styles.scss";
import { AppProps } from "next/app";
import React from 'react';
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import Head from "next/head";
import MainNav from "@components/main-nav";
import ApplicationContextProvider from "@contexts/application";
import StatusBar from '@components/status-bar';
import { isMobile } from "react-device-detect";
import MobileNotSupported from '@components/mobile-not-supported';
import {getSession, SessionProvider} from 'next-auth/react'
import {GetServerSideProps} from 'next';

export default function App({ Component, pageProps: {session, ...pageProps} }: AppProps) {
  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (<SessionProvider session={session}>
      <ApplicationContextProvider>
        <Head>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
          <title>App | Web3 Decentralized Development</title>
          <link href="/favicon.ico" rel="shortcut icon"  />
        </Head>
        <NationDialog>
          <MainNav />
          <WebThreeDialog />
          <Component {...pageProps} />
          <StatusBar />
        </NationDialog>
      </ApplicationContextProvider>
  </SessionProvider>
  );
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {session: await getSession(ctx)},
  };
};
