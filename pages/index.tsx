import {useEffect} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import LoadingGlobal from "components/loading-global";

import {useAppState} from "contexts/app-state";
import getConfig from "next/config";

export default function Index() {
  const { replace } = useRouter();
  const {publicRuntimeConfig} = getConfig()

  const { state } = useAppState();

  useEffect(() => {
    if (!state?.supportedChains)
      return;

    if (state?.supportedChains?.length)
      replace(`/networks`).then(() => {});
    else if (state.currentUser?.walletAddress?.toLowerCase() === publicRuntimeConfig.adminWallet.toLowerCase())
      replace(`/setup`).then(() => {});

  }, [state?.supportedChains]);

  return(
    <LoadingGlobal show={true} />
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
