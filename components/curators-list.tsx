import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import CustomContainer from "components/custom-container";
import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";

import { useAppState } from "contexts/app-state";
import { changeLoadState } from "contexts/reducers/change-load";

import { Curator } from "interfaces/curators";

import useApi from "x-hooks/use-api";
import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

import CuratorListBar from "./curator-list-bar";
import CuratorListItem from "./curator-list-item";
import InfiniteScroll from "./infinite-scroll";
import ScrollTopButton from "./scroll-top-button";

interface CuratorsPages {
  curators: Curator[];
  page: number;
}

export default function CuratorsList() {
  const { t } = useTranslation(["common", "council"]);

  const { search } = useSearch();

  const [hasMore, setHasMore] = useState(false);
  const [truncatedData, setTruncatedData] = useState(false);
  const [curatorsPage, setCuratorsPage] = useState<CuratorsPages[]>([]);

  const { page, nextPage, goToFirstPage } = usePage();

  const { searchCurators } = useApi();

  const { state, dispatch } = useAppState();

  function handlerSearch() {
    if (!state.Service?.network?.active) return;

    dispatch(changeLoadState(true));

    searchCurators({
      isCurrentlyCurator: true,
      networkName: state.Service?.network?.lastVisited,
      sortBy: "acceptedProposals",
      order: "asc",
      search: search,
      page
    })
      .then(({ rows, pages, currentPage }) => {
        console.log('rows', rows, pages, currentPage)
        if (currentPage > 1) {
          if (curatorsPage.find((el) => el.page === currentPage)) return;

          const tmp = [...curatorsPage, { page: currentPage, curators: rows }];

          tmp.sort((pageA, pageB) => {
            if (pageA.page < pageB.page) return -1;
            if (pageA.page > pageB.page) return 1;

            return 0;
          });
          setCuratorsPage(tmp);
        } else {
          setCuratorsPage([{ page: currentPage, curators: rows }]);
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

  useEffect(handlerSearch, [page, state.Service?.network?.lastVisited]);

  useEffect(() => {
    if (page) {
      const pagesToValidate = [...Array(+page).keys()].map((i) => i + 1);

      setTruncatedData(!pagesToValidate.every((pageV) =>
          curatorsPage.find((el) => el.page === pageV)));
    }
  }, [page, curatorsPage]);

  return (
    <CustomContainer>
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
      
      {(curatorsPage.some((el) => el.curators?.length === 0) && (
        <NothingFound description={t("council:errors.not-found")}>
          {state.Service?.network?.active ? (
            <InternalLink
              href="/new-network"
              label={String(t("actions.create-one"))}
              uppercase
              blank={
                state.Service?.network?.active.name !==
                state.Settings?.defaultNetworkConfig?.name
              }
            />
          ) : (
            ""
          )}
        </NothingFound>
      )) || <></>}

      <CuratorListBar />
      {(curatorsPage.some((el) => el.curators?.length > 0) && (
        <InfiniteScroll
          handleNewPage={nextPage}
          isLoading={state.loading?.isLoading}
          hasMore={hasMore}
        >
          {curatorsPage.map(({ curators }) => {
            return curators?.map((curator) => (
              <CuratorListItem
                curator={curator}
              />
            ));
          })}
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  );
}