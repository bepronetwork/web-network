import { api } from "services/api";

import { UpdateNetworkParams } from "types/api";

export async function useUpdateNetwork(payload: UpdateNetworkParams): Promise<string> {
  return api
    .put("/network", payload)
    .then(({ data }) => data);
}