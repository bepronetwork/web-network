import '../styles/styles.scss'
import { AppProps } from 'next/app'
import Head from 'next/head'
import BeproService from '../services/bepro';

export default function App({ Component, pageProps }: AppProps) {

  const init = async () => {
    await BeproService.init();
  }

  init();
  return <>
    <Head>
    </Head>
    <Component {...pageProps} />
  </>
}
