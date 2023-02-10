import { useEffect } from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import {GetServerSideProps} from "next/types";

import { useNetwork } from "x-hooks/use-network";

export default function Home() {
  const { replace, query } = useRouter();
  
  const { getURLWithNetwork } = useNetwork();

  useEffect(() => {
    replace(getURLWithNetwork(`/bounties`, {
      network: query?.network
    }));
  }, []);

  return null;
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
