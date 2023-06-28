import { useTranslation } from "next-i18next";

import CuratorListItem from "components/lists/curators/item/controller";
import List from "components/lists/list/controller";

import { CuratorsListPaginated } from "types/api";

interface CuratorsListViewProps {
  curators: CuratorsListPaginated;
}

export default function CuratorsListView({ curators }: CuratorsListViewProps) {
  const { t } = useTranslation(["common", "council"]);

  const isListEmpty = !curators?.count;
  const hasMore = !isListEmpty && curators?.currentPage < curators?.pages;
  const header = [
    t("council:council-table.address"),
    t("council:council-table.closed-proposals"),
    t("council:council-table.disputed-proposals"),
    t("council:council-table.disputes"),
    t("council:council-table.total-votes"),
    t("council:council-table.actions"),
  ];

  return (
    <List
      isEmpty={isListEmpty}
      withSearchAndFilters={false}
      header={header}
      hasMorePages={hasMore}
    >
      {curators?.rows?.map((curator) => (
        <CuratorListItem
          key={curator?.address}
          curator={curator}
        />
      ))}
    </List>
  );
}
