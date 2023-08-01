import { useState } from "react";

import { PaginatedData } from "types/api";

export default function usePaginatedList() {
  const [list, setList] = useState<PaginatedData<unknown>>();

  function update(paginatedData: PaginatedData<unknown>) {
    if (!paginatedData) return;

    setList(previous => {
      if (!previous || paginatedData.currentPage === 1) 
        return {
          ...paginatedData,
          rows: paginatedData.rows
        };

      return {
        ...previous,
        ...paginatedData,
        rows: previous.rows.concat(paginatedData.rows)
      };
    });
  }

  return {
    list,
    update
  };
}