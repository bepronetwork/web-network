import '../styles/styles.scss'
import { AppProps } from 'next/app'

import Head from 'next/head'
import BeproService from '../services/bepro';
import MainNav from '../components/main-nav';
import React, { useState } from 'react';
import Loading from '../components/loading';

export default function App({ Component, pageProps }: AppProps) {
const [loading, setLoading] = useState<boolean>(false);

  const init = async () => {
    await BeproService.init();
  }
  init();

  return ( 
  <>
    <Head>
    </Head>
    <MainNav></MainNav>
    <Component loading={setLoading} {...pageProps} />
    <Loading show={loading} />
  </>
  )
}
