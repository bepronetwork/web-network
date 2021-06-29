import "../styles/styles.scss";
import { AppProps } from "next/app";
import Head from "next/head";
import BeproService from "../services/bepro";
import MainNav from "../components/main-nav";

export default function App({ Component, pageProps }: AppProps) {
  (async () => {
    await BeproService.init();
  })();

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <title>WEB Network</title>
      </Head>
      <MainNav />
      <Component {...pageProps} />
    </>
  );
}
