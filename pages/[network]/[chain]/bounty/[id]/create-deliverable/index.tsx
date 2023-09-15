import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import CreateDeliverablePage from "components/pages/create-deliverable/controller";

import { getBountyData } from "x-hooks/api/bounty/get-bounty-data";

export default CreateDeliverablePage;

export const getServerSideProps: GetServerSideProps = async ({query,
  locale
}) => {
  const bounty = await getBountyData(query);

  return {
    props: {
      bounty,
      ...(await serverSideTranslations(locale, [
        "common",
        "custom-network",
        "deliverable",
        "bounty",
        "connect-wallet-button",
      ])),
    },
  };
};
