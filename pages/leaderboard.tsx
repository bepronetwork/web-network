import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import LeaderBoardPage from "components/pages/leaderboard/view";

import { emptyPaginatedData } from "helpers/api";

import { getLeaderboardData } from "x-hooks/api/leaderboard";

export default LeaderBoardPage;

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const leaderboard = await getLeaderboardData(query)
    .then(({ data }) => data)
    .catch(() => emptyPaginatedData);
  
  return {
    props: {
      leaderboard,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "custom-network",
        "leaderboard",
      ])),
    },
  };
};
