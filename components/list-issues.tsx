import React, {useEffect, useRef, useState} from "react";
import {FormControl, InputGroup} from "react-bootstrap";
import {isMobile} from "react-device-detect";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {UrlObject} from "url";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import Button from "components/button";
import ContractButton from "components/contract-button";
import CustomContainer from "components/custom-container";
import InfiniteScroll from "components/infinite-scroll";
import IssueFilters from "components/issue-filters";
import IssueListItem from "components/issue-list-item";
import ListSort from "components/list-sort";
import NothingFound from "components/nothing-found";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ScrollTopButton from "components/scroll-top-button";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";

import {isProposalDisputable} from "helpers/proposal";

import {IssueBigNumberData, IssueState} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

import SelectNetwork from "./bounties/select-network";
import NetworkListBarColumn from "./network-list-bar-column";

type Filter = {
  label: string;
  value: string;
  emptyState: string;
};

type FiltersByIssueState = Filter[];

interface ListIssuesProps {
  creator?: string;
  redirect?: string | UrlObject;
  filterState?: IssueState;
  emptyMessage?: string;
  buttonMessage?: string;
  pullRequesterLogin?: string;
  pullRequesterAddress?: string;
  proposer?: string;
  disputableFilter?: "dispute" | "merge";
  inView?: boolean;
  variant?: "bounty-hall" | "profile" | "network" | "management"
}

interface IssuesPage {
  page: number;
  issues: IssueBigNumberData[];
}

export default function ListIssues({
  creator,
  filterState,
  emptyMessage,
  buttonMessage,
  pullRequesterLogin,
  pullRequesterAddress,
  proposer,
  redirect,
  disputableFilter,
  inView,
  variant = "network"
}: ListIssuesProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "bounty", "pull-request", "proposal"]);

  const [hasMore, setHasMore] = useState(false);
  const [truncatedData, setTruncatedData] = useState(false);
  const [issuesPages, setIssuesPages] = useState<IssuesPage[]>([]);
  const [totalBounties, setTotalBounties] = useState<number>(0);

  const searchTimeout = useRef(null);

  const { chain } = useChain();
  const { searchIssues } = useApi();
  const { dispatch, state: appState } = useAppState();
  const { page, nextPage, goToFirstPage } = usePage();
  const { search, setSearch, clearSearch } = useSearch();

  const [searchState, setSearchState] = useState(search);

  const isManagement = variant === 'management';
  const isProfile = variant === "profile";
  const isBountyHall = variant === "bounty-hall";
  const isOnNetwork = !!router?.query?.network;
  const variantIssueItem = isManagement ? variant : (isProfile || isBountyHall) ? "multi-network" : "network"
  const isNotFound = issuesPages.every((el) => el.issues?.length === 0) && !appState.loading?.isLoading
  const columns = [
    t("bounty:management.name"),
    t("bounty:management.link"),
    t("bounty:management.hide"),
    t("bounty:management.cancel"),
  ];
  

  const { network: queryNetwork, networkName, repoId, time, state, sortBy, order } = router.query as {
    network: string;
    networkName: string;
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

  const listTitle = proposer ? t("proposal:label_other") : 
                    pullRequesterLogin || pullRequesterAddress ? t("pull-request:label_other") : 
                    t("bounty:label_other");

  const [filterByState,] = useState<Filter>(filtersByIssueState[0]);

  function isListEmpy(): boolean {
    return issuesPages.every((el) => el.issues?.length === 0);
  }

  function hasFilter(): boolean {
    return !!(state || time || repoId || search);
  }

  function showClearButton(): boolean {
    return search.trim() !== "";
  }

  function handleClearSearch(): void {
    setSearchState("");
    clearSearch();
  }

  async function disputableFilterFn(bounties: IssueBigNumberData[]): Promise<IssueBigNumberData[]> {
    const bountiesIds =
      (await Promise.all(bounties.map(async ({ contractId, mergeProposals}) => {
        const proposals = [];

        for await (const proposal of mergeProposals) {
          const isDisputed = await appState.Service?.active?.isProposalDisputed(contractId, proposal.contractId);
          const isDisputable = isProposalDisputable(proposal?.createdAt,
                                                    +appState.Service?.network?.times?.disputableTime,
                                                    await appState.Service?.active.getTimeChain());

          if (disputableFilter === "merge" && !isDisputed && !isDisputable) proposals.push(proposal);
          else if (disputableFilter === "dispute" && !isDisputed && isDisputable) proposals.push(proposal);
        }

        return { contractId, status: !!proposals.length };
      })))
        .filter(({ status }) => status)
        .map(({ contractId }) => contractId);

    return bounties.filter(({ contractId }) => bountiesIds.includes(contractId));
  }

  function handlerSearch() {
    if (router.pathname === "/[network]" && !queryNetwork ||
        router.pathname.includes("/[network]/[chain]") && (!queryNetwork || !chain || inView === false)) return;

    dispatch(changeLoadState(true));

    searchIssues({
      page,
      repoId,
      time,
      state: filterState || state,
      search,
      sortBy: sortBy || 'createdAt',
      order,
      address: creator,
      pullRequesterLogin,
      pullRequesterAddress,
      proposer,
      networkName: (isBountyHall || networkName === "all" || (isProfile && !isOnNetwork && !networkName) ? "" :
        networkName || appState.Service?.network?.active?.name),
      allNetworks: isBountyHall || "",
      visible: !isManagement,
      chainId: chain?.chainId?.toString(),
    })
      .then(async ({ count, rows, pages, currentPage }) => {
        setTotalBounties(count);
        const issues = disputableFilter ? await disputableFilterFn(rows) : rows;

        if (currentPage > 1) {
          if (issuesPages.find((el) => el.page === currentPage)) return;

          const tmp = [...issuesPages, { page: currentPage, issues }];

          tmp.sort((pageA, pageB) => {
            if (pageA.page < pageB.page) return -1;
            if (pageA.page > pageB.page) return 1;

            return 0;
          });
          setIssuesPages(tmp);
        } else {
          setIssuesPages([{ page: currentPage, issues }]);
        }

        setHasMore(currentPage < pages);
      })
      .catch((error) => {
        console.debug("Error fetching issues", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }

  function handleSearch(event) {
    if (event.key !== "Enter") return;

    setSearch(searchState);
  }

  function handleNotFoundClick() {
    if (!redirect) return router.push('/create-bounty');

    router.push(redirect);
  }

  useEffect(() => {
    if (page && !!issuesPages.length) {
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
    chain,
    creator,
    proposer,
    appState.Service?.network?.active?.name,
    inView,
    appState.supportedChains,
    networkName
  ]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current =  setTimeout(() => {
      setSearch(searchState);
    }, 1000);

    return () => clearTimeout(searchTimeout.current);
  }, [searchState]);


  function isRenderFilter() {
    if(isMobile) return false;

    return (!isListEmpy() || (isListEmpy() && hasFilter()));
  }

  if(inView !== null && inView === false) return null;

  return (
    <CustomContainer
      className={isProfile && "px-0 mx-0" || ""}
      childWrapperClassName={isProfile && "justify-content-left" || ""}
      col={isProfile || isManagement ? "col-12" : undefined}
    >
      {(isBountyHall || isProfile) && (
        <div className="d-flex flex-row align-items-center">
          <h3 className="text-capitalize font-weight-medium">{listTitle}</h3>
          <div className="ms-2">
            <span className="p family-Regular text-gray-400 bg-gray-850 border-radius-4 p-1 px-2">{totalBounties}</span>
          </div>
        </div>
      )}
      {isRenderFilter() ? (
        <div
          className={"row align-items-center list-actions sticky-top bg-body"}
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
                placeholder={t("bounty:search")}
                onKeyDown={handleSearch}
              />

              {showClearButton() && (
                <button
                  className="btn bg-gray-900 border-0 py-0 px-3"
                  onClick={handleClearSearch}
                >
                  <CloseIcon width={10} height={10} />
                </button>
              )}
            </InputGroup>
          </div>

          <div className="col-auto">
            <div className="d-flex align-items-center">
              <span className="caption text-gray-500 text-nowrap mr-1 font-weight-normal">
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
                    sortBy: "amount,fundingAmount",
                    order: "DESC",
                    label: t("sort.types.highest-bounty")
                  },
                  {
                    value: "lowest-bounty",
                    sortBy: "amount,fundingAmount",
                    order: "ASC",
                    label: t("sort.types.lowest-bounty")
                  }
                ]}
              />
            </div>
          </div>

          <div className="col-auto">
            {(!filterState && !isProfile && !isManagement) && <IssueFilters />}

            {(!filterState && isProfile) && <SelectNetwork isCurrentDefault={isProfile && isOnNetwork} />}
          </div>
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
      {isManagement && !isNotFound && (
        <div className="row row align-center mb-2 px-3">
          {columns?.map((item, key) => (
            <>
              <div
                className={`d-flex col-${
                  item === "Name" ? "6" : "2 justify-content-center"
                }`}
                key={key}
              >
                <span>{item}</span>
              </div>
            </>
          ))}
        </div>
      )}
      {isNotFound ? (
        <div className="pt-4">
          <NothingFound description={emptyMessage || filterByState.emptyState}>
            {(appState.currentUser?.walletAddress && !isBountyHall) && (
              <ReadOnlyButtonWrapper>
                <ContractButton onClick={handleNotFoundClick}>
                  {buttonMessage || String(t("actions.create-one"))}
                </ContractButton>
                </ReadOnlyButtonWrapper>
              )}
          </NothingFound>
        </div>
      ) : null}
      {(issuesPages.some((el) => el.issues?.length > 0) && (
        <InfiniteScroll
          handleNewPage={nextPage}
          isLoading={appState.loading?.isLoading}
          hasMore={hasMore}>
          {issuesPages.map(({ issues }) => {
            return issues?.map((issue) => (
              <IssueListItem
                issue={issue}
                key={`${issue.repository_id}/${issue.githubId}`}
                variant={variantIssueItem}
              />
            ));
          })}
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  );
}
