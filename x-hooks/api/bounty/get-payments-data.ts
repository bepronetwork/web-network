import { ParsedUrlQuery } from "querystring";

import { api } from "services/api";

import { NetworkPaymentsData, PaymentsData } from "types/api";

/**
 * Get bounties from api based on query filters
 * @param query current url query
 * @returns list of filtered bounties
 */
export async function getPaymentsData(query: ParsedUrlQuery) {
  return api.get<PaymentsData | NetworkPaymentsData>("/payments", {
    params: query
  });
}