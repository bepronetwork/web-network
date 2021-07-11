import "../styles/styles.scss";
import { AppProps } from "next/app";
import WebThreeDialog from "../components/web3-dialog";
import Head from "next/head";
import BeproService from "../services/bepro";
import MainNav from "../components/main-nav";
import React from "react";
import ApplicationContextProvider from '../contexts/application';
import { LoadingContextProvider } from "../providers/loading-provider";

export default function App({ Component, pageProps }: AppProps) {

  const init = async () => {
    await BeproService.init();
  }

  init();

  return (
    <ApplicationContextProvider>
      <LoadingContextProvider>
        <Head>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <title>WEB Network</title>
        </Head>
        <MainNav />
        <WebThreeDialog />
        <Component {...pageProps} />
      </LoadingContextProvider>
    </ApplicationContextProvider>
  )
}
