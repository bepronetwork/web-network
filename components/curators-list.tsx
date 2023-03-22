import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import CuratorListBar from "components/curator-list-bar";
import CuratorListItem from "components/curator-list-item";
import CustomContainer from "components/custom-container";
import InfiniteScroll from "components/infinite-scroll";
import NothingFound from "components/nothing-found";
import ScrollTopButton from "components/scroll-top-button";

import { useAppState } from "contexts/app-state";
import { changeLoadState } from "contexts/reducers/change-load";

import { Curator } from "interfaces/curators";

import useApi from "x-hooks/use-api";
import usePage from "x-hooks/use-page";

interface CuratorsPages {
  curators: Curator[];
  page: number;
}

export default function CuratorsList({ inView }: { inView?: boolean }) {
  const { query } = useRouter();
  const { t } = useTranslation(["common", "council"]);

  const [hasMore, setHasMore] = useState(false);
  const [truncatedData, setTruncatedData] = useState(false);
  const [isEmptyPage, setIsEmptyPage] = useState<boolean>();
  const [curatorsPage, setCuratorsPage] = useState<CuratorsPages[]>([]);

  const { searchCurators } = useApi();
  const { state, dispatch } = useAppState();
  const { page, nextPage, goToFirstPage } = usePage();

  function handlerSearch() {
    if (!state.Service?.network?.active || inView === false || !query?.chain) return;

    dispatch(changeLoadState(true));

    searchCurators({
      isCurrentlyCurator: true,
      networkName: state.Service?.network?.active?.name,
      sortBy: "acceptedProposals",
      order: "asc",
      page,
      chainShortName: query.chain.toString()
    })
      .then(({ rows, pages, currentPage }) => {
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

        setIsEmptyPage(rows.length > 0 ? false : true)
        setHasMore(currentPage < pages);
      })
      .catch((error) => {
        console.error("Error fetching issues", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }

  useEffect(handlerSearch, [page, state.Service?.network?.active, inView, query?.chain]);

  useEffect(() => {
    if (page) {
      const pagesToValidate = [...Array(+page).keys()].map((i) => i + 1);

      setTruncatedData(!pagesToValidate.every((pageV) =>
          curatorsPage.find((el) => el.page === pageV)));
    }
  }, [page, curatorsPage]);

  if(inView !== null && inView === false) return null;

  return (
    <CustomContainer>
      <CuratorListBar />
      {(isEmptyPage && (
        <NothingFound description={t("council:errors.not-found")} />
      )) || <></>}

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
      
      {((isEmptyPage === false) && (
        <InfiniteScroll
          handleNewPage={nextPage}
          isLoading={state.loading?.isLoading}
          hasMore={hasMore}
        >
          {
            curatorsPage
              .flatMap(({ curators }) => curators )
              .map(curator => (<CuratorListItem
                                key={`curator-${curator?.address}`}
                                curator={curator}
                              />))
          }
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  );
}