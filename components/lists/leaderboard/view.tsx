import { useTranslation } from "next-i18next";

import CustomContainer from "components/custom-container";
import If from "components/If";
import InfiniteScroll from "components/infinite-scroll";
import LeaderBoardListHeader from "components/lists/leaderboard/header/view";
import LeaderBoardListItem from "components/lists/leaderboard/item/view";
import ListSearchAndFilters from "components/lists/search-and-filters/view";
import NothingFound from "components/nothing-found";
import ResponsiveWrapper from "components/responsive-wrapper";
import ScrollTopButton from "components/scroll-top-button";

import { LeaderBoardPaginated } from "types/api";

interface LeaderBoardListViewProps {
  leaderboard: LeaderBoardPaginated;
  searchString: string;
  onClearSearch: () => void;
  onNextPage: () => void;
  onSearchInputChange: (event) => void;
  onSearchClick: () => void;
  onEnterPressed: (event) => void;
}

export default function LeaderBoardListView({
  leaderboard,
  searchString,
  onClearSearch,
  onNextPage,
  onSearchInputChange,
  onSearchClick,
  onEnterPressed,
}: LeaderBoardListViewProps) {
  const { t } = useTranslation(["common", "leaderboard"]);

  const hasData = !!leaderboard?.count;
  const hasMore = hasData && leaderboard?.currentPage < leaderboard?.pages;
  const hasFilter = searchString?.trim() !== "";
  const showSearchFilter = hasData || !hasData && hasFilter;
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

  return (
    <CustomContainer>
      <If condition={showSearchFilter}>
        <ListSearchAndFilters
          searchString={searchString}
          placeholder={t("leaderboard:search")}
          sortOptions={sortOptions}
          hasFilter={hasFilter}
          onSearchClick={onSearchClick}
          onSearchInputChange={onSearchInputChange}
          onEnterPressed={onEnterPressed}
          onClearSearch={onClearSearch}
        />
      </If>
      
      <ResponsiveWrapper
        xs={false}
        xl={true}
        className="row"
      >
        <LeaderBoardListHeader />
      </ResponsiveWrapper>

      <If
        condition={hasData}
        otherwise={
          <div className="pt-4">
            <NothingFound description={t("leaderboard:not-found")} />
          </div>
        }
      >
        <div className="px-3">
          <InfiniteScroll
            handleNewPage={onNextPage}
            hasMore={hasMore}
            className="d-flex flex-column gap-3"
          >
            {leaderboard?.rows?.map((item) => <LeaderBoardListItem key={item?.address} {...item} />)}
          </InfiniteScroll>
        </div>
      </If>
      <ScrollTopButton />
    </CustomContainer>
  );
}