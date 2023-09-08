import { StartWorkingParams } from "interfaces/api";

import { api } from "services/api";

export async function useStartWorking(payload : StartWorkingParams) {
  return api
    .put("/issue/working", payload)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
}
