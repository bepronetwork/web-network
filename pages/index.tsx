import {useEffect} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import {useAppState} from "contexts/app-state";

import ExplorePage from "pages/explore";

const { publicRuntimeConfig } = getConfig();

export default function Index() {
  const { replace } = useRouter();
  
  const { state } = useAppState();

  useEffect(() => {
    if (!state?.supportedChains)
      return;

    if (state?.supportedChains?.length)
      replace(`/networks`);
    else if (state.currentUser?.walletAddress?.toLowerCase() === publicRuntimeConfig.adminWallet.toLowerCase())
      replace(`/setup`);

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
