import { emptyPaginatedData } from "helpers/api";

import { Curator, SearchCuratorParams } from "interfaces/curators";

import { api } from "services/api";

import { PaginatedData } from "types/api";

export async function useSearchCurators({
  page = "1",
  address = "",
  isCurrentlyCurator = undefined,
  networkName = "",
  sortBy = "updatedAt",
  order = "DESC",
  chainShortName = ""
}: SearchCuratorParams) {
  const params = new URLSearchParams({
    page,
    address,
    networkName,
    sortBy,
    order,
    chainShortName,
    ...(isCurrentlyCurator !== undefined && { isCurrentlyCurator: isCurrentlyCurator.toString()} || {})
  }).toString();

  return api
    .get<PaginatedData<Curator>>(`/search/curators/?${params}`)
    .then(({ data }) => data)
    .catch(() => emptyPaginatedData as PaginatedData<Curator>);
}