import { ParsedUrlQuery } from "querystring";

import { api } from "services/api";

import { CuratorsListPaginated } from "types/api";

/**
 * Get curators from api based on query filters
 * @param query current url query
 * @returns list of filtered bounties
 */
export async function getCuratorsListData(query: ParsedUrlQuery) {
  return api.get<CuratorsListPaginated>("/search/curators", {
    params: query
  });
}