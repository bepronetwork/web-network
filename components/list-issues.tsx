import React, { useContext, useEffect, useState } from "react";
import { FormControl, InputGroup } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import Button from "components/button";
import CustomContainer from "components/custom-container";
import InfiniteScroll from "components/infinite-scroll";
import InternalLink from "components/internal-link";
import IssueFilters from "components/issue-filters";
import IssueListItem from "components/issue-list-item";
import ListSort from "components/list-sort";
import NothingFound from "components/nothing-found";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ScrollTopButton from "components/scroll-top-button";

import { ApplicationContext } from "contexts/application";
import { useNetwork } from "contexts/network";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { IssueData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";
import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

type Filter = {
  label: string;
  value: string;
  emptyState: string;
};

type FiltersByIssueState = Filter[];

interface ListIssuesProps {
  creator?: string;
  redirect?: string;
  filterState?: string;
  emptyMessage?: string;
  buttonMessage?: string;
  pullRequester?: string;
}

interface IssuesPage {
  page: number;
  issues: IssueData[];
}

export default function ListIssues({
  creator,
  redirect,
  filterState,
  emptyMessage,
  buttonMessage,
  pullRequester
}: ListIssuesProps): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext);

  const router = useRouter();
  const { t } = useTranslation(["common", "bounty"]);

  const [hasMore, setHasMore] = useState(false);
  const [truncatedData, setTruncatedData] = useState(false);
  const [issuesPages, setIssuesPages] = useState<IssuesPage[]>([]);

  const { getURLWithNetwork } = useNetworkTheme();
  const { activeNetwork } = useNetwork();
  const { searchIssues } = useApi();
  const { page, nextPage, goToFirstPage } = usePage();
  const { search, setSearch, clearSearch } = useSearch();
  const [searchState, setSearchState] = useState(search);

  const { repoId, time, state, sortBy, order } = router.query as {
    repoId: string;
    time: string;
    state: string;
    sortBy: string;
    order: string;
  };

  const filtersByIssueState: FiltersByIssueState = [
    {
      label: t("filters.bounties.all"),
      value: "all",
      emptyState: t("filters.bounties.not-found")
    },
    {
      label: t("filters.bounties.open"),
      value: "open",
      emptyState: t("filters.bounties.open-not-found")
    },
    {
      label: t("filters.bounties.draft"),
      value: "draft",
      emptyState: t("filters.bounties.draft-not-found")
    },
    {
      label: t("filters.bounties.closed"),
      value: "closed",
      emptyState: t("filters.bounties.closed-not-found")
    }
  ];

  const [filterByState,] = useState<Filter>(filtersByIssueState[0]);

  function isListEmpy(): boolean {
    return issuesPages.every((el) => el.issues?.length === 0);
  }

  function hasFilter(): boolean {
    if (state || time || repoId || search) return true;

    return false;
  }

  function showClearButton(): boolean {
    if (search.trim() !== "") return true;

    return false;
  }

  function handleClearSearch(): void {
    setSearchState("");
    clearSearch();
  }

  function handlerSearch() {
    if (!activeNetwork) return;

    dispatch(changeLoadState(true));

    searchIssues({
      page,
      repoId,
      time,
      state: filterState || state,
      search,
      sortBy,
      order,
      creator,
      pullRequester,
      networkName: activeNetwork?.name
    })
      .then(({ rows, pages, currentPage }) => {
        if (currentPage > 1) {
          if (issuesPages.find((el) => el.page === currentPage)) return;

          const tmp = [...issuesPages, { page: currentPage, issues: rows }];

          tmp.sort((pageA, pageB) => {
            if (pageA.page < pageB.page) return -1;
            if (pageA.page > pageB.page) return 1;

            return 0;
          });

          setIssuesPages(tmp);
        } else {
          setIssuesPages([{ page: currentPage, issues: rows }]);
        }

        setHasMore(currentPage < pages);
      })
      .catch((error) => {
        console.error("Error fetching issues", error);
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
          issuesPages.find((el) => el.page === pageV)));
    }
  }, [page, issuesPages]);

  useEffect(handlerSearch, [
    page,
    search,
    repoId,
    time,
    state,
    sortBy,
    order,
    creator,
    activeNetwork
  ]);

  return (
    <CustomContainer>
      {!isListEmpy() || (isListEmpy() && hasFilter()) ? (
        <div
          className={"d-flex align-items-center gap-20 list-actions sticky-top"}
        >
          <div className="w-100">
            <InputGroup>
              <InputGroup.Text onClick={handlerSearch}>
                <SearchIcon />
              </InputGroup.Text>

              <FormControl
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className="p-2"
                placeholder={t("bounty:search")}
                onKeyDown={handleSearch}
              />

              {showClearButton() && (
                <button
                  className="btn bg-black border-0 rounded-8 py-0 px-3"
                  onClick={handleClearSearch}
                >
                  <CloseIcon width={10} height={10} />
                </button>
              )}
            </InputGroup>
          </div>

          <div className="d-flex align-items-center">
            <span className="caption-small text-white-50 text-nowrap mr-1">
              {t("sort.label")}
            </span>

            <ListSort
              options={[
                {
                  value: "newest",
                  sortBy: "createdAt",
                  order: "DESC",
                  label: t("sort.types.newest")
                },
                {
                  value: "oldest",
                  sortBy: "createdAt",
                  order: "ASC",
                  label: t("sort.types.oldest")
                },
                {
                  value: "highest-bounty",
                  sortBy: "amount",
                  order: "DESC",
                  label: t("sort.types.highest-bounty")
                },
                {
                  value: "lowest-bounty",
                  sortBy: "amount",
                  order: "ASC",
                  label: t("sort.types.lowest-bounty")
                }
              ]}
            />
          </div>

          {!filterState && <IssueFilters />}
        </div>
      ) : (
        ""
      )}

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

      {issuesPages.every((el) => el.issues?.length === 0) &&
      !loading.isLoading ? (
        <div className="pt-4">
          <NothingFound description={emptyMessage || filterByState.emptyState}>
            <ReadOnlyButtonWrapper>
              <InternalLink
                className="read-only-button"
                label={buttonMessage || String(t("actions.create-one"))}
                href={redirect || getURLWithNetwork("/create-bounty")}
                uppercase
              />
            </ReadOnlyButtonWrapper>
          </NothingFound>
        </div>
      ) : null}

      {(issuesPages.some((el) => el.issues?.length > 0) && (
        <InfiniteScroll
          handleNewPage={nextPage}
          isLoading={loading.isLoading}
          hasMore={hasMore}>
          {issuesPages.map(({ issues }) => {
            return issues?.map((issue) => (
              <IssueListItem issue={issue} key={`${issue.repository_id}/${issue.githubId}`} />
            ));
          })}
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  );
}
