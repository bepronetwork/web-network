import { ReactNode, useState } from "react";

import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";

import ListView from "components/lists/list/view";

import { isOnNetworkPath } from "helpers/network";

import { SortOption } from "types/components";
import { Action } from "types/utils";

import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

interface ListProps {
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: Action;
  sortOptions?: SortOption[];
  children?: ReactNode;
  header?: string[];
  withSearchAndFilters?: boolean;
  infinite?: boolean;
  hasMorePages?: boolean;
  searchPlaceholder?: string;
}

export default function List({
  children,
  withSearchAndFilters = true,
  ...props
}: ListProps) {
  const { query, pathname } = useRouter();
  
  const [searchState, setSearchState] = useState("");

  const debouncedSearchUpdater = useDebouncedCallback((value) => setSearch(value), 500);

  const { nextPage } = usePage();
  const { search, setSearch, clearSearch } = useSearch();

  const { state, time } = query;

  const hasFilter = !!(state || time || search);
  const isOnNetwork = isOnNetworkPath(pathname);

  function handleSearchChange(e) {
    setSearchState(e.target.value);
    debouncedSearchUpdater(e.target.value);
  }

  function handleClearSearch(): void {
    setSearchState("");
    clearSearch();
  }

  function updateSearch() {
    setSearch(searchState);
  }

  function handleSearch(event) {
    if (event.key !== "Enter") return;

    updateSearch();
  }

  return (
    <ListView
      {...props}
      searchString={searchState}
      isOnNetwork={isOnNetwork}
      hasFilter={hasFilter}
      withSearchAndFilters={withSearchAndFilters}
      onSearchClick={updateSearch}
      onClearSearch={handleClearSearch}
      onNextPage={nextPage}
      onEnterPressed={handleSearch}
      onSearchInputChange={handleSearchChange}
    >
      {children}
    </ListView>
  );
}
