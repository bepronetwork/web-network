import {FormControl, InputGroup} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import SelectNetwork from "components/bounties/select-network";
import ContractButton from "components/contract-button";
import CustomContainer from "components/custom-container";
import If from "components/If";
import InfiniteScroll from "components/infinite-scroll";
import IssueFilters from "components/issue-filters";
import IssueListItem from "components/issue-list-item";
import ListSort from "components/list-sort";
import NothingFound from "components/nothing-found";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ScrollTopButton from "components/scroll-top-button";

import { SearchBountiesPaginatedBigNumber } from "types/components";

interface BountiesListViewProps {
  bounties?: SearchBountiesPaginatedBigNumber;
  emptyMessage?: string;
  buttonMessage?: string;
  variant: "bounty-hall" | "profile" | "network" | "management";
  type: "bounties" | "pull-requests" | "proposals";
  searchString: string;
  isOnNetwork?: boolean;
  isConnected?: boolean;
  hasFilter?: boolean;
  onClearSearch: () => void;
  onNotFoundClick: () => void;
  onNextPage: () => void;
  onSearchInputChange: (event) => void;
  onSearchClick: () => void;
  onEnterPressed: (event) => void;
}

export default function BountiesListView({
  emptyMessage,
  buttonMessage,
  variant,
  bounties,
  type,
  searchString,
  isOnNetwork,
  isConnected,
  hasFilter,
  onClearSearch,
  onNotFoundClick,
  onNextPage,
  onSearchInputChange,
  onSearchClick,
  onEnterPressed,
}: BountiesListViewProps) {
  const { t } = useTranslation(["common", "bounty", "pull-request", "proposal"]);

  const isManagement = variant === "management";
  const isProfile = variant === "profile";
  const isBountyHall = variant === "bounty-hall";
  const hasIssues = !!bounties?.count;
  const hasMorePages = hasIssues && bounties?.currentPage < bounties?.pages;
  const showClearButton = searchString?.trim() !== "";
  const showSearchFilter = hasIssues || !hasIssues && hasFilter;
  const variantIssueItem = isManagement ? variant : (isProfile || isBountyHall) ? "multi-network" : "network"

  const columns = [
    t("bounty:management.name"),
    t("bounty:management.link"),
    t("bounty:management.hide"),
    t("bounty:management.cancel"),
  ];

  const listTitleByType = {
    "bounties": t("bounty:label_other"),
    "pull-requests": t("pull-request:label_other"),
    "proposals": t("proposal:label_other")
  };

  const sortOptions = [
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
  ];

  return (
    <CustomContainer
      className={isProfile && "px-0 mx-0" || ""}
      childWrapperClassName={isProfile && "justify-content-left" || ""}
      col={isProfile || isManagement ? "col-12" : undefined}
    >
      <If condition={isBountyHall || isProfile}>
        <div className="d-flex flex-row align-items-center">
          <h3 className="text-capitalize font-weight-medium">{listTitleByType[type]}</h3>
          <div className="ms-2">
            <span className="p family-Regular text-gray-400 bg-gray-850 border-radius-4 p-1 px-2">
              {bounties?.count || 0}
            </span>
          </div>
        </div>
      </If>

      <If condition={showSearchFilter}>
        <div
          className={"row align-items-center list-actions sticky-top bg-body"}
        >
          <div className="col">
            <InputGroup className="border-radius-8">
              <InputGroup.Text className="cursor-pointer" onClick={onSearchClick}>
                <SearchIcon />
              </InputGroup.Text>

              <FormControl
                value={searchString}
                onChange={onSearchInputChange}
                className="p-2"
                placeholder={t("bounty:search")}
                onKeyDown={onEnterPressed}
              />

              <If condition={showClearButton}>
                <button
                  className="btn bg-gray-900 border-0 py-0 px-3"
                  onClick={onClearSearch}
                >
                  <CloseIcon width={10} height={10} />
                </button>
              </If>
            </InputGroup>
          </div>

          <div className="col-auto d-none d-xl-flex">
            <div className="d-flex align-items-center">
              <span className="caption text-gray-500 text-nowrap mr-1 font-weight-normal">
                {t("sort.label")}
              </span>

              <ListSort options={sortOptions} />
            </div>
          </div>

          <div className="col-auto">
            <If condition={!isProfile && !isManagement}>
              <IssueFilters />
            </If>

            <div className="d-none d-xl-flex">
              <If condition={isProfile}>
                <SelectNetwork isCurrentDefault={isProfile && isOnNetwork} />
              </If>
              
            </div>
          </div>
        </div>
      </If>

      <If condition={isManagement && hasIssues}>
        <div className="row row align-center mb-2 px-3">
          {columns?.map((item) => (
            <div
              className={`d-flex col-${
                item === "Name" ? "6" : "2 justify-content-center"
              }`}
              key={item}
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </If>

      <If 
        condition={hasIssues}
        otherwise={
          <div className="pt-4">
            <NothingFound description={emptyMessage || t("filters.bounties.not-found")}>
              {(isConnected && !isBountyHall && !isManagement) && (
                <ReadOnlyButtonWrapper>
                  <ContractButton onClick={onNotFoundClick}>
                    {buttonMessage || String(t("actions.create-one"))}
                  </ContractButton>
                  </ReadOnlyButtonWrapper>
                )}
            </NothingFound>
          </div>
        }
      >
        <InfiniteScroll
          handleNewPage={onNextPage}
          hasMore={hasMorePages}
        >
          {bounties?.rows?.map(issue => 
              <IssueListItem
                issue={issue}
                key={`${issue.repository_id}/${issue.githubId}`}
                variant={variantIssueItem}
              />)}
        </InfiniteScroll>
      </If>
      <ScrollTopButton />
    </CustomContainer>
  );
}
