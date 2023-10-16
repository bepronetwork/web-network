import { ParsedUrlQuery } from "querystring";

import { IssueData } from "interfaces/issue-data";

import { api } from "services/api";

/**
 * Get bounty from api based on query filters
 * @param query current url query
 * @returns bounty
 */
export async function getBountyData(query: ParsedUrlQuery): Promise<IssueData | null> {
  const { id, network: networkName, chain: chainName } = query;

  return api
    .get<IssueData>(`/issue/${id}/${networkName}/${chainName}`)
    .then(({ data }) => data)
    .catch(() => null);
}
