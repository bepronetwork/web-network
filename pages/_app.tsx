import React from "react";

import {GetServerSideProps} from "next";
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import {AppProps} from "next/app";

import CreateBountyModal from "components/create-bounty-modal";
import InvalidAccountWalletModal from "components/invalid-account-wallet-modal";
import Loading from "components/loading";
import MainNav from "components/main-nav";
import ReadOnlyContainer from "components/read-only-container";
import Seo from "components/seo";
import StatusBar from "components/status-bar";
import Toaster from "components/toaster";
import WebThreeDialog from "components/web3-dialog";

import RootProviders from "contexts";

import "../styles/styles.scss";
import "../node_modules/@primer/css/dist/markdown.css";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {

  return (
    <>
      <SessionProvider session={session}>
        <RootProviders>
          <Seo />
          <ReadOnlyContainer>
            <WebThreeDialog />
            <InvalidAccountWalletModal/>
            <MainNav />
            <div id="root-container">
              <Component {...pageProps} />
            </div>
            <CreateBountyModal/>
            <StatusBar />
            <Toaster />
            <Loading />
          </ReadOnlyContainer>
        </RootProviders>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation(App);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
