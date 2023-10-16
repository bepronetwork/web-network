import { ParsedUrlQuery } from "querystring";

import { Proposal } from "interfaces/proposal";

import { api } from "services/api";

/**
 * Get proposal from api based on query filters (proposalId, issueId, network, chain)
 * @param query current url query
 * @returns proposal
 */
export async function getProposalData(query: ParsedUrlQuery) {
  return api.get<Proposal>("/merge-proposal", {
    params: query
  })
    .then(({ data }) => data);
}