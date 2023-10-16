import { kycSession } from "interfaces/kyc-session";

import { api } from "services/api";

export async function useGetKycSession(asNewSession = false): Promise<kycSession> {
  const params = asNewSession ? {asNewSession}: {};

  return api.get("/kyc/init",{
    params
  })
  .then(({ data }) => data)
  .catch((error) => {
    throw error;
  });
}