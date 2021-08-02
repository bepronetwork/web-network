import "../styles/styles.scss";
import { AppProps } from "next/app";
import WebThreeDialog from "../components/web3-dialog";
import Head from "next/head";
import BeproService from "../services/bepro";
import MainNav from "../components/main-nav";
import React from "react";
import { LoadingContextProvider } from "../providers/loading-provider";
import { Provider as AccountProvider } from "hooks/useAccount";

export default function App({ Component, pageProps }: AppProps) {
  (async () => {
    await BeproService.init();
  })();

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <title>WEB Network</title>
      </Head>
      <AccountProvider>
        <LoadingContextProvider>
          <MainNav />
          <WebThreeDialog />
          <Component {...pageProps} />
        </LoadingContextProvider>
      </AccountProvider>
    </>
  );
}
