import React from "react";

import {GetServerSideProps} from "next";
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import {AppProps} from "next/app";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {GoogleAnalytics} from "nextjs-google-analytics";

import ConsentCookie from "components/consent-cokie";
import InvalidAccountWalletModal from "components/invalid-account-wallet-modal";
import Loading from "components/loading";
import MainNav from "components/main-nav";
import ReadOnlyContainer from "components/read-only-container";
import ReAuthorizeGithubModal from "components/reauthorize-github-modal";
import Seo from "components/seo";
import StatusBar from "components/status-bar";
import Toaster from "components/toaster";
import WebThreeDialog from "components/web3-dialog";
import WrongNetworkModal from "components/wrong-network-modal";

import RootProviders from "contexts";

import "../styles/styles.scss";
import "../node_modules/@primer/css/dist/markdown.css";

function App({ Component, pageProps: { session, currentIssue, ...pageProps } }: AppProps) {

  const {asPath} = useRouter();
  const {publicRuntimeConfig} = getConfig();

  if (asPath.includes('api-doc'))
    return <Component {...pageProps}></Component>

  return (
    <>
      <GoogleAnalytics gaMeasurementId={publicRuntimeConfig.gaMeasureID} trackPageViews />
      <SessionProvider session={session}>
        <RootProviders>
          <Seo  issueMeta={currentIssue} />
          <ReadOnlyContainer>
            <WebThreeDialog />
            <InvalidAccountWalletModal/>
            <ReAuthorizeGithubModal />
            <MainNav />
            <div id="root-container">
              <Component {...pageProps} />
            </div>
            <WrongNetworkModal />
            <StatusBar />
            <Toaster />
            <Loading />
          </ReadOnlyContainer>
        </RootProviders>
      </SessionProvider>
      <ConsentCookie />
    </>
  );
}

export default appWithTranslation(App);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
