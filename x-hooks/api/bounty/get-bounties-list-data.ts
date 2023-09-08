import { ParsedUrlQuery } from "querystring";

import { api } from "services/api";

import { SearchBountiesPaginated } from "types/api";

/**
 * Get bounties from api based on query filters
 * @param query current url query
 * @returns list of filtered bounties
 */
export async function getBountiesListData(query: ParsedUrlQuery) {
  return api.get<SearchBountiesPaginated>("/search/issues", {
    params: query
  });
}