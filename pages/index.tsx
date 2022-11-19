import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import LoadingGlobal from "components/loading-global";

export default function Index() {
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
