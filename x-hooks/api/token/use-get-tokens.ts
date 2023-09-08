import { Token } from "interfaces/token";

import { api } from "services/api";

export async function useGetTokens(chainId?: string, networkName?: string) {
  return api
    .get<Token[]>("/search/tokens", { params: {chainId, networkName} })
    .then(({ data }) => data)
    .catch((error) => {
      throw error;
    });
}