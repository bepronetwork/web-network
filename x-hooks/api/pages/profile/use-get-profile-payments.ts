import { ParsedUrlQuery } from "querystring";

import { getPaymentsData } from "x-hooks/api/bounty";
import { useGetChains } from "x-hooks/api/chain";

export async function useGetProfilePayments(query: ParsedUrlQuery) {
  const [payments, chains] = await Promise.all([
    getPaymentsData({ ...query, groupBy: "network" })
      .then(({ data }) => data)
      .catch(() => null),
    useGetChains(),
  ]);

  return {
    payments,
    chains
  }
}