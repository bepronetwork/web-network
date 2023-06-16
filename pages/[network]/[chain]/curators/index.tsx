import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import NetworkCurators from "components/pages/network-curators/controller";

import { emptyBountiesPaginated } from "helpers/api";

import getBountiesListData from "x-hooks/api/get-bounties-list-data";

export default NetworkCurators;

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const { type } = query;

  const state = {
    "ready-to-propose": "proposable",
    "ready-to-dispute": "disputable",
    "ready-to-close": "mergeable",
  }[type?.toString()];

  const getBountiesList = (filters) => getBountiesListData(filters)
    .then(({ data }) => data)
    .catch(() => emptyBountiesPaginated);

  const [bounties, totalReadyBounties] = await Promise.all([
    state ? getBountiesList({ ...query, state }) : emptyBountiesPaginated,
    getBountiesList({ state: "ready" }).then(({ count }) => count)
  ]);
    
  return {
    props: {
      bounties,
      totalReadyBounties,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "council",
        "connect-wallet-button",
      ])),
    },
  };
};
