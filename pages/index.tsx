import { useEffect } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next/types";

import LoadingGlobal from "components/loading-global";

import { useAppState } from "contexts/app-state";

export default function Index() {
  const { query, replace } = useRouter();

  const { state } = useAppState();

  useEffect(() => {
    const networkName = state.Service?.network?.active?.name;
    
    if (!networkName) return;

    const transformedName = networkName.toLowerCase().replaceAll(" ", "-");

    if (transformedName === query?.network) return;

    replace(`/${transformedName}`);
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
