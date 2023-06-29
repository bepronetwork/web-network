import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import SelectNetwork from "components/bounties/select-network";
import ContractButton from "components/contract-button";
import GoTopButton from "components/go-top-button/controller";
import If from "components/If";
import InfiniteScroll from "components/infinite-scroll";
import ListHeader from "components/lists/list/header/view";
import ListSearchBar from "components/lists/list/search-bar/view";
import ListSort from "components/lists/sort/controller";
import NothingFound from "components/nothing-found";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ResponsiveWrapper from "components/responsive-wrapper";

import { SortOption } from "types/components";
import { Action } from "types/utils";

interface ListViewProps {
  searchString: string;
  searchPlaceholder?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: Action;
  isOnNetwork?: boolean;
  hasFilter?: boolean;
  sortOptions?: SortOption[];
  children?: ReactNode;
  networkFilter?: boolean;
  withSearchAndFilters?: boolean;
  header?: string[];
  infinite?: boolean;
  hasMorePages?: boolean;
  onNextPage?: () => void;
  onClearSearch: () => void;
  onSearchInputChange: (event) => void;
  onSearchClick: () => void;
  onEnterPressed: (event) => void;
}

export default function ListView(props: ListViewProps) {
  const { t } = useTranslation("common");

  const {
    searchString,
    searchPlaceholder,
    isEmpty,
    emptyMessage,
    emptyAction,
    isOnNetwork,
    hasFilter,
    sortOptions,
    children,
    networkFilter,
    withSearchAndFilters,
    header,
    infinite,
    hasMorePages,
    onNextPage,
    onSearchClick,
    onClearSearch,
    onEnterPressed,
    onSearchInputChange,
  } = props;

  return (
    <div className="px-0">
      <If condition={withSearchAndFilters}>
        <div className="row w-100 align-items-center list-actions sticky-top bg-dark">
          <div className="col">
            <ListSearchBar
              searchString={searchString}
              placeholder={searchPlaceholder}
              hasFilter={hasFilter}
              onSearchClick={onSearchClick}
              onSearchInputChange={onSearchInputChange}
              onEnterPressed={onEnterPressed}
              onClearSearch={onClearSearch}
            />
          </div>

          <If condition={!!sortOptions}>
            <div className="col-auto px-0">
              <ListSort options={sortOptions} />
            </div>
          </If>

          <If condition={networkFilter}>
            <div className="d-none d-xl-flex">
              <SelectNetwork isCurrentDefault={isOnNetwork} />
            </div>
          </If>
        </div>
      </If>

      <If
        condition={!isEmpty}
        otherwise={
          <div className="pt-4">
            <NothingFound description={emptyMessage || t("misc.empty-list")}>
              <If condition={!!emptyAction}>
                <ReadOnlyButtonWrapper>
                  <ContractButton onClick={emptyAction?.onClick}>
                    {emptyAction?.label}
                  </ContractButton>
                </ReadOnlyButtonWrapper>
              </If>
            </NothingFound>
          </div>
        }
      >
        <ResponsiveWrapper xs={false} xl={true} className="row">
          <ListHeader columns={header} />
        </ResponsiveWrapper>

        <If condition={infinite} otherwise={<div className="d-flex flex-column gap-3">{children}</div>}>
          <InfiniteScroll
            handleNewPage={onNextPage}
            hasMore={hasMorePages}
            className="d-flex flex-column gap-3"
          >
            {children}
          </InfiniteScroll>
        </If>

        <GoTopButton />
      </If>
    </div>
  );
}
