import { AppProps } from "next/app";
import { GetServerSideProps } from "next";
import { isMobile } from "react-device-detect";
import { appWithTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { getSession, SessionProvider } from "next-auth/react";


import Seo from "@components/seo";
import MainNav from "@components/main-nav";
import StatusBar from "@components/status-bar";
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import MobileNotSupported from "@components/mobile-not-supported";

import ApplicationContextProvider from "@contexts/application";

import useRepos from "@x-hooks/use-repos";
import useNetwork from "@x-hooks/use-network";

import "../styles/styles.scss";
import NetworkThemeInjector from "@components/custom-network/network-theme-injector";

function App({ Component, pageProps: { session, currentIssue,...pageProps } }: AppProps) {
  const [[, repos]] = useRepos();
  const [loaded, setLoaded] = useState(false);
  const { network } = useNetwork()

  if (isMobile) {
    return <MobileNotSupported />;
  }

  useEffect(() => {
    setLoaded(!!repos?.length && !!network)
  }, [repos, network, network?.colors]);

  return (
    <>
      <Seo issueMeta={currentIssue} />
      <SessionProvider session={session}>
        <ApplicationContextProvider>
            <div className={`${network?.isClosed && 'read-only-network' || ''}`}>
              <NetworkThemeInjector />
              <NationDialog>
                <MainNav />
                <WebThreeDialog />
                <div className="pb-5">
                  {!loaded ? `` : <Component {...pageProps} />}
                </div>
                <StatusBar />
              </NationDialog>
            </div>
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
