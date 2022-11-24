import { useEffect } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import LoadingGlobal from "components/loading-global";

import { useAppState } from "contexts/app-state";

export default function Index() {
  const { replace } = useRouter();

  const { state } = useAppState();

  useEffect(() => {
    if (state.Service?.network?.active?.name && state.Service?.network?.active?.isDefault)
      replace(`/${state.Service?.network?.active?.name}`);
  }, [state.Service?.network?.active?.name]);

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
