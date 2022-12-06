import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import LeaderBoardList  from "components/leaderboard/leaderboard-list";
import PageHero from "components/page-hero";

export default function LeaderBoardPage() {
  const { t } = useTranslation(["common", "leaderboard"]);

  return (
    <>
      <PageHero
        title={t("leaderboard:title")}
        subtitle={t("leaderboard:sub-title")}
        infos={[]}
      />
      <LeaderBoardList />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
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
