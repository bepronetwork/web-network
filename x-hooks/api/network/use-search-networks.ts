import { emptyPaginatedData } from "helpers/api";

import { SearchNetworkParams } from "interfaces/api";
import { Network } from "interfaces/network";
import { PaginatedData } from "interfaces/paginated-data";

import { api } from "services/api";

export default function useSearchNetworks({
  page = "1",
  name = "",
  creatorAddress = "",
  networkAddress = "",
  sortBy = "updatedAt",
  order = "DESC",
  search = "",
  isClosed = undefined,
  isRegistered = undefined,
  isDefault = undefined,
  isNeedCountsAndTokensLocked = undefined,
  chainId = "",
  chainShortName = ""
}: SearchNetworkParams): Promise<PaginatedData<Network>> {
  const params = {
    page,
    name,
    creatorAddress,
    networkAddress,
    sortBy,
    order,
    search,
    chainId,
    chainShortName,
    ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
    ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {}),
    ... (isDefault !== undefined && { isDefault: isDefault.toString() } || {}),
    ...((isNeedCountsAndTokensLocked !== undefined && {
      isNeedCountsAndTokensLocked: isNeedCountsAndTokensLocked.toString(),
    }) || {})
  };

  return api
    .get<PaginatedData<Network>>("/search/networks", { params })
    .then(({ data }) => data)
    .catch(() => emptyPaginatedData);
}