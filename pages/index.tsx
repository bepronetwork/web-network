import { useEffect } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import LoadingGlobal from "components/loading-global";

export default function Index() {
  const { replace } = useRouter();

  useEffect(() => {
    replace(`/explore`);
  }, []);

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
