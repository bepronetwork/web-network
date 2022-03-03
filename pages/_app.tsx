import { AppProps } from "next/app";
import { GetServerSideProps } from "next";
import { isMobile } from "react-device-detect";
import { appWithTranslation } from "next-i18next";
import { getSession, SessionProvider } from "next-auth/react";

import RootProviders from "contexts";

import Seo from "components/seo";
import MainNav from "components/main-nav";
import StatusBar from "components/status-bar";
import NationDialog from "components/nation-dialog";
import WebThreeDialog from "components/web3-dialog";
import MobileNotSupported from "components/mobile-not-supported";

import "../styles/styles.scss";

function App({ Component, pageProps: { session, currentIssue,...pageProps } }: AppProps) {
  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (
    <>
      <Seo issueMeta={currentIssue} />
      <SessionProvider session={session}>
        <RootProviders>
          <NationDialog>
            <MainNav />
            <WebThreeDialog />
            <div className="pb-5">
              <Component {...pageProps} />
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
