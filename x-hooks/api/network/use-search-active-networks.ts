import { emptyPaginatedData } from "helpers/api";

import { SearchActiveNetworkParams } from "interfaces/api";
import { Network } from "interfaces/network";

import { api } from "services/api";

import { PaginatedData } from "types/api";

export async function useSearchActiveNetworks({
  page = "1",
  creatorAddress = "",
  sortBy = "updatedAt",
  order = "DESC",
  isClosed = undefined,
  isRegistered = undefined,
  name = ""
}: SearchActiveNetworkParams) {
  const params = new URLSearchParams({
    page,
    creatorAddress,
    sortBy,
    order,
    name,
    ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
    ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {})
  }).toString();

  return api
    .get<PaginatedData<Network>>(`/search/networks/active/?${params}`)
    .then(({ data }) => data)
    .catch(() => emptyPaginatedData as PaginatedData<Network>);
}