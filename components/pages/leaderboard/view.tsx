import { useTranslation } from "next-i18next";

import LeaderBoardList from "components/lists/leaderboard/controller";
import PageHero from "components/page-hero";

import { LeaderBoardPageProps } from "types/pages";

export default function LeaderBoardPage({ leaderboard }: LeaderBoardPageProps) {
  const { t } = useTranslation(["common", "leaderboard"]);

  return (
    <>
      <PageHero
        title={t("leaderboard:title")}
        subtitle={t("leaderboard:sub-title")}
        infos={[]}
      />

      <LeaderBoardList
        leaderboard={leaderboard}
      />
    </>
  );
}