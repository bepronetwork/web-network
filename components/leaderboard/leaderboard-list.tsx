import React, {useEffect, useRef, useState} from "react";
import {FormControl, InputGroup} from "react-bootstrap";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import Button from "components/button";
import CustomContainer from "components/custom-container";
import If from "components/If";
import InfiniteScroll from "components/infinite-scroll";
import IssueFilters from "components/issue-filters";
import LeaderBoardListBar from "components/leaderboard/leaderboard-list-bar";
import LeaderBoardListItem from "components/leaderboard/leaderboard-list-item";
import ListSort from "components/list-sort";
import NothingFound from "components/nothing-found";
import ResponsiveWrapper from "components/responsive-wrapper";
import ScrollTopButton from "components/scroll-top-button";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";

import {LeaderBoard} from "interfaces/leaderboard";

import useApi from "x-hooks/use-api";
import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

interface LeaderBoardPage {
  page: number;
  leadBoard: LeaderBoard[];
}

export default function LeaderBoardList() {
  const {dispatch, state: appState} = useAppState();

  const router = useRouter();
  const { t } = useTranslation(["common", "leaderboard"]);

  const { search, setSearch, clearSearch } = useSearch();
  
  const [hasMore, setHasMore] = useState(false);
  const [searchState, setSearchState] = useState(search);
  const [truncatedData, setTruncatedData] = useState(false);
  const [leaderBoardPages, setLeaderBoardPages] = useState<LeaderBoardPage[]>([]);

  const searchTimeout = useRef(null);

  const { searchLeaderBoard } = useApi();
  const { page, nextPage, goToFirstPage } = usePage();

  const isProfilePage = router?.asPath?.includes("profile");

  const { time, state, sortBy, order } = router.query as {
    time: string;
    state: string;
    sortBy: string;
    order: string;
  };

  function isListEmpy(): boolean {
    return leaderBoardPages.every((el) => el.leadBoard?.length === 0);
  }

  function hasFilter(): boolean {
    return !!(state || time || search);
  }

  function showClearButton(): boolean {
    return search.trim() !== "";
  }

  function handleClearSearch(): void {
    setSearchState("");
    clearSearch();
  }

  function handlerSearch() {
    dispatch(changeLoadState(true));

    searchLeaderBoard({
      page,
      time,
      search,
      sortBy,
      order,
    })
      .then(({ rows, pages, currentPage }) => {
        if (currentPage > 1) {
          if (leaderBoardPages.find((el) => el.page === currentPage)) return;

          const tmp = [...leaderBoardPages, { page: currentPage, leadBoard: rows }];

          tmp.sort((pageA, pageB) => {
            if (pageA.page < pageB.page) return -1;
            if (pageA.page > pageB.page) return 1;

            return 0;
          });
          setLeaderBoardPages(tmp);
        } else {
          setLeaderBoardPages([{ page: currentPage, leadBoard: rows }]);
        }

        setHasMore(currentPage < pages);
      })
      .catch((error) => {
        console.error("Error fetching leaderBoard", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }

  function handleSearch(event) {
    if (event.key !== "Enter") return;

    setSearch(searchState);
  }

  useEffect(() => {
    if (page) {
      const pagesToValidate = [...Array(+page).keys()].map((i) => i + 1);

      setTruncatedData(!pagesToValidate.every((pageV) =>
          leaderBoardPages.find((el) => el.page === pageV)));
    }
  }, [page, leaderBoardPages]);

  useEffect(handlerSearch, [
    page,
    search,
    time,
    sortBy,
    order
  ]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current =  setTimeout(() => {
      setSearch(searchState);
    }, 1000);

    return () => clearTimeout(searchTimeout.current);
  }, [searchState]);

  
  function isRenderFilter() {
    return (!isListEmpy() || (isListEmpy() && hasFilter()))
  }

  return (
    <CustomContainer 
      className={isProfilePage && "px-0 mx-0" || ""}
      childWrapperClassName={isProfilePage && "justify-content-left" || ""}
    >
      <If condition={isRenderFilter()}>
        <ResponsiveWrapper xs={false} xl={true}>
          <div
            className={"row w-100 align-items-center list-actions sticky-top bg-dark"}
          >
            <div className="col">
              <InputGroup className="border-radius-8">
                <InputGroup.Text className="cursor-pointer" onClick={handlerSearch}>
                  <SearchIcon />
                </InputGroup.Text>

                <FormControl
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  className="p-2"
                  placeholder={t("leaderboard:search")}
                  onKeyDown={handleSearch}
                />

                {showClearButton() && (
                  <button
                    className="btn bg-black border-0 py-0 px-3"
                    onClick={handleClearSearch}
                  >
                    <CloseIcon width={10} height={10} />
                  </button>
                )}
              </InputGroup>
            </div>

            <div className="col-auto d-flex align-items-center">
              <span className="caption-small text-white-50 text-nowrap mr-1">
                {t("sort.label")}
              </span>

              <ListSort
                options={[
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
                  },
                  {
                    value: "newest",
                    sortBy: "updatedAt",
                    order: "DESC",
                    label: t("sort.types.newest")
                  },
                  {
                    value: "oldest",
                    sortBy: "updatedAt",
                    order: "ASC",
                    label: t("sort.types.oldest")
                  },
                ]}
              />
            </div>

            <div className="col-auto">
              <IssueFilters onlyTimeFrame={true} />
            </div>
          </div>
        </ResponsiveWrapper>
      </If>
      
      <LeaderBoardListBar/>
      
      {(truncatedData && (
        <div className="row justify-content-center mb-3 pt-5">
          <div className="d-flex col-6 align-items-center justify-content-center">
            <span className="caption-small mr-1">
              {t("errors.results-truncated")}
            </span>
            <Button onClick={goToFirstPage}>{t("actions.back-to-top")}</Button>
          </div>
        </div>
      )) || <></>}

      {leaderBoardPages.every((el) => el.leadBoard?.length === 0) &&
      !appState.loading?.isLoading ? (
        <div className="pt-4">
          <NothingFound description={t("leaderboard:not-found")}>
          </NothingFound>
        </div>
      ) : null}
      {(leaderBoardPages.some((el) => el.leadBoard?.length > 0) && (
        <InfiniteScroll
          handleNewPage={nextPage}
          isLoading={appState.loading?.isLoading}
          hasMore={hasMore}>
          {leaderBoardPages.map(({ leadBoard }) => {
            return leadBoard?.map((item) => (
              <LeaderBoardListItem key={item?.address} user={item}/>
            ));
          })}
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  );
}