import { ParsedUrlQuery } from "querystring";

import { emptyPaginatedData } from "helpers/api";

import { SearchBountiesPaginated } from "types/api";

import { getBountiesListData } from "x-hooks/api/bounty";

type UserType = "proposer" | "creator" | "pullRequester" | "governor";

export async function useGetProfileBounties(query: ParsedUrlQuery, type: UserType ) {
  const filter = type === "governor" ? { 
    visible: "both",
    sortBy: query?.sortBy || "visible",
    order: query?.order || "ASC"
  } : {
    [type]: query?.wallet
  };

  return getBountiesListData({
    ...query,
    ...filter
  })
    .then(({ data }) => data)
    .catch(() => emptyPaginatedData as SearchBountiesPaginated);
}