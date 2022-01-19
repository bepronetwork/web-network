import { AppProps } from "next/app";
import { GetServerSideProps } from "next";
import { isMobile } from "react-device-detect";
import { appWithTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { getSession, SessionProvider } from "next-auth/react";

import "../styles/styles.scss";

import Seo from "@components/seo";
import MainNav from "@components/main-nav";
import StatusBar from "@components/status-bar";
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import MobileNotSupported from "@components/mobile-not-supported";

import ApplicationContextProvider from "@contexts/application";

import useRepos from "@x-hooks/use-repos";
import useNetwork from "@x-hooks/use-network";

function App({ Component, pageProps: { session, currentIssue,...pageProps } }: AppProps) {
  const [[, repos]] = useRepos();
  const [loaded, setLoaded] = useState(false);
  const { network, colorsToCSS } = useNetwork()

  if (isMobile) {
    return <MobileNotSupported />;
  }

  useEffect(() => {
    setLoaded(!!repos?.length);
  }, [repos]);

  return (
    <>
      <style>
        {colorsToCSS()}
      </style>

      <Seo issueMeta={currentIssue} />
      <SessionProvider session={session}>
        <ApplicationContextProvider>
          <NationDialog>
            <MainNav />
            <WebThreeDialog />
            <div className="pb-5">
              {!loaded ? `` : <Component {...pageProps} />}
            </div>
            <StatusBar />
          </NationDialog>
        </ApplicationContextProvider>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation(App);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: { session: await getSession(ctx) },
  };
};
