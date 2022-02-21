import "../styles/styles.scss";
import { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import MainNav from "@components/main-nav";
import RootProviders from "@contexts/index";
import StatusBar from "@components/status-bar";
import { isMobile } from "react-device-detect";
import MobileNotSupported from "@components/mobile-not-supported";
import { getSession, SessionProvider } from "next-auth/react";
import { GetServerSideProps } from "next";
import useRepos from "@x-hooks/use-repos";
import { appWithTranslation } from "next-i18next";
import Seo from "@components/seo";

function App({ Component, pageProps: { session, currentIssue,...pageProps } }: AppProps) {
  const [[, repos]] = useRepos();
  const [loaded, setLoaded] = useState(false);

  if (isMobile) {
    return <MobileNotSupported />;
  }

  useEffect(() => {
    setLoaded(!!repos?.length);
  }, [repos]);

  return (
    <>
      <Seo issueMeta={currentIssue} />
      <SessionProvider session={session}>
        <RootProviders>
            <NationDialog>
              <MainNav />
              <WebThreeDialog />
              <div className="pb-5">
                {!loaded ? `` : <Component {...pageProps} />}
              </div>
              <StatusBar />
            </NationDialog>
        </RootProviders>
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
