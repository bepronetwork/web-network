import { ParsedUrlQuery } from "querystring";

import { SupportedChainData } from "interfaces/supported-chain-data";

import { api } from "services/api";

/**
 * Get chain from api based on query filters
 * @param query current url query
 * @returns list of filtered chains
 */
export async function useGetChains(query?: ParsedUrlQuery): Promise<SupportedChainData[]> {
  return api.get("/chains", {
    params: query
  })
    .then(({ data }) => {
      if (data?.error) throw data?.error;

      return data?.result;
    });
}