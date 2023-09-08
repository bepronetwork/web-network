import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import NetworkCurators from "components/pages/network-curators/controller";

import { emptyBountiesPaginated, emptyCuratorsPaginated, emptyNetworkOverview } from "helpers/api";

import { getBountiesListData } from "x-hooks/api/bounty";
import { getCuratorsListData } from "x-hooks/api/curator";
import getNetworkOverviewData from "x-hooks/api/get-overview-data";

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

  const [bounties, curators, overview] = await Promise.all([
    state ? getBountiesList({ ...query, state }) : emptyBountiesPaginated,
    getCuratorsListData({ isCurrentlyCurator: 'true', ...query })
      .then(({ data }) => data)
      .catch(() => emptyCuratorsPaginated),
    getNetworkOverviewData(query)
      .then(({ data }) => data)
      .catch(() => emptyNetworkOverview)
  ]);
    
  return {
    props: {
      bounties,
      totalReadyBounties: overview?.bounties?.ready || 0,
      totalDistributed: overview?.networkTokenOnClosedBounties || 0,
      totalLocked: overview?.curators?.tokensLocked || 0,
      curators,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "council",
        "connect-wallet-button",
      ])),
    },
  };
};
