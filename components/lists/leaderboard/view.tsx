import { useTranslation } from "next-i18next";

import LeaderBoardListItem from "components/lists/leaderboard/item/view";
import List from "components/lists/list/controller";

import { LeaderBoardPaginated } from "types/api";

interface LeaderBoardListViewProps {
  leaderboard: LeaderBoardPaginated;
}

export default function LeaderBoardListView({
  leaderboard
}: LeaderBoardListViewProps) {
  const { t } = useTranslation(["common", "leaderboard"]);

  const hasData = !!leaderboard?.count;
  const hasMore = hasData && leaderboard?.currentPage < leaderboard?.pages;

  const sortOptions = [
    {
      value: "most-nfts",
      sortBy: "numberNfts",
      order: "DESC",
      label: t("leaderboard:sort.most-nfts")
    },
    {
      value: "lowest-nfts",
      sortBy: "numberNfts",
      order: "ASC",
      label: t("leaderboard:sort.lowest-nfts")
    }
  ];
  
  const header = [
    t("leaderboard:table.address"),
    t("leaderboard:table.github-handle"),
    t("leaderboard:table.nfts"),
    t("leaderboard:table.actions"),
  ];

  return (
    <List
      isEmpty={!hasData}
      emptyMessage={t("leaderboard:not-found")}
      sortOptions={sortOptions}
      header={header}
      hasMorePages={hasMore}
      searchPlaceholder={t("leaderboard:search")}
      infinite
    >
      {leaderboard?.rows?.map((item) => <LeaderBoardListItem key={item?.address} {...item} />)}
    </List>
  );
}