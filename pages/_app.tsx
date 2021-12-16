import "../styles/styles.scss";
import { AppProps } from "next/app";
import React, {useEffect, useState} from 'react';
import NationDialog from "@components/nation-dialog";
import WebThreeDialog from "@components/web3-dialog";
import MainNav from "@components/main-nav";
import ApplicationContextProvider from "@contexts/application";
import StatusBar from '@components/status-bar';
import { isMobile } from "react-device-detect";
import MobileNotSupported from '@components/mobile-not-supported';
import {getSession, SessionProvider} from 'next-auth/react'
import {GetServerSideProps} from 'next';
import useRepos from '@x-hooks/use-repos';
import {appWithTranslation} from 'next-i18next';
import {DefaultSeo} from 'next-seo'
import SEO_CONFIG from '../next-seo-config'
function App({ Component, pageProps: {session, ...pageProps} }: AppProps) {
  const [[, repos]] = useRepos();
  const [loaded, setLoaded] = useState(false);

  if (isMobile) {
    return <MobileNotSupported />;
  }

  useEffect(() => {
    setLoaded(!!repos?.length)
  }, [repos])

  return (
    <SessionProvider session={session}>
      <ApplicationContextProvider>
        <NationDialog>
          <MainNav />
          <WebThreeDialog />
          <div className="pb-5">{!loaded ? `` : (
            <>
            <DefaultSeo {...SEO_CONFIG}/>
            <Component {...pageProps} />
            </>
          ) }</div>
          <StatusBar />
        </NationDialog>
      </ApplicationContextProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(App);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {session: await getSession(ctx)},
  };
};
