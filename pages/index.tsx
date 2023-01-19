import {useEffect} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import ExplorePage from "./explore";

import {useAppState} from "contexts/app-state";

export default function Index() {
  const { replace } = useRouter();
  const {publicRuntimeConfig} = getConfig()

  useEffect(() => {
    if (!state?.supportedChains)
      return;

    if (state?.supportedChains?.length)
      replace(`/networks`).then(() => {});
    else if (state.currentUser?.walletAddress?.toLowerCase() === publicRuntimeConfig.adminWallet.toLowerCase())
      replace(`/setup`).then(() => {});

  }, [state?.supportedChains]);

  return(
   <ExplorePage />
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "custom-network", "bounty", "connect-wallet-button"]))
    }
  };
};
