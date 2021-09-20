import "../styles/styles.scss";
import { AppProps } from "next/app";
import React from "react";
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import Head from "next/head";
import MainNav from "@components/main-nav";
import ApplicationContextProvider from "@contexts/application";
import { isMobile } from "react-device-detect";
import MobileNotSupported from '@components/mobile-not-supported';

export default function App({ Component, pageProps }: AppProps) {
  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (
    <>
      <ApplicationContextProvider>
        <Head>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
          <title>WEB Network</title>
        </Head>
        <NationDialog>
          <MainNav />
          <WebThreeDialog />
          <Component {...pageProps} />
        </NationDialog>
      </ApplicationContextProvider>
    </>
  );
}
