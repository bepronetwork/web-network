import { api } from "services/api";

import { UpdateBountyVisibilityParams } from "types/api";

export default async function useUpdateBountyVisibility(payload: UpdateBountyVisibilityParams) {
  return api
    .put("/network/management", payload)
    .then(({ data }) => data)
    .catch((error) => {
      throw error;
    });
}
