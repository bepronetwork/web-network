import { useEffect, useState } from "react";

import { useDebouncedCallback } from "use-debounce";

import LeaderBoardListView from "components/lists/leaderboard/view";

import { LeaderBoardPaginated } from "types/api";
import { LeaderBoardPageProps } from "types/pages";

import usePage from "x-hooks/use-page";
import useSearch from "x-hooks/use-search";

export default function LeaderBoardList({
  leaderboard
}: LeaderBoardPageProps) {
  const [leaderBoardData, setLeaderBoardData] = useState<LeaderBoardPaginated>();

  const { search, setSearch, clearSearch } = useSearch();

  const [searchState, setSearchState] = useState(search);

  const debouncedSearchUpdater = useDebouncedCallback((value) => setSearch(value), 500);
  
  const { nextPage } = usePage();

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

  useEffect(() => {
    if (!leaderboard) return;
    
    setLeaderBoardData(previous => {
      if (!previous || leaderboard.currentPage === 1) 
        return {
          ...leaderboard,
          rows: leaderboard.rows
        };

      return {
        ...previous,
        ...leaderboard,
        rows: previous.rows.concat(leaderboard.rows)
      };
    });
  }, [leaderboard]);

  return (
    <LeaderBoardListView
      leaderboard={leaderBoardData}
      searchString={searchState}
      onClearSearch={handleClearSearch}
      onNextPage={nextPage}
      onSearchInputChange={handleSearchChange}
      onSearchClick={updateSearch}
      onEnterPressed={handleSearch}
    />
  );
}