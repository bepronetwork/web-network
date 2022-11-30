import React from "react";

import {GetServerSideProps} from "next";
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import {AppProps} from "next/app";

import CreateBountyModal from "components/create-bounty-modal";
import InvalidAccountWalletModal from "components/invalid-account-wallet-modal";
import Loading from "components/loading";
import MainNav from "components/main-nav";
import Seo from "components/seo";
import StatusBar from "components/status-bar";
import Toaster from "components/toaster";
import WebThreeDialog from "components/web3-dialog";

import RootProviders from "contexts";

import "../styles/styles.scss";




function App({
  Component,
  pageProps: { session, currentIssue, ...pageProps },
}: AppProps) {

  return (
    <>
      <Seo issueMeta={currentIssue}/>
      <SessionProvider session={session}>
        <RootProviders>
          <>
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
          </>
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
