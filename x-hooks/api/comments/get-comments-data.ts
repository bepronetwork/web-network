import { ParsedUrlQuery } from "querystring";

import { IssueDataComment } from "interfaces/issue-data";

import { api } from "services/api";

/**
 * Get comments from api based on query filters
 * @param query current url query
 * @returns list of filtered comments
 */
export async function getCommentsData(query: ParsedUrlQuery) {
  return api
    .get<IssueDataComment | IssueDataComment[]>("/comments", {
      params: query,
    })
    .then(({ data }) => data)
    .catch(() => null);
}
