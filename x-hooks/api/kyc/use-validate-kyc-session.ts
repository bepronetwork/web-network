import { api } from "services/api";

export async function useValidateKycSession(session_id: string){
  return api.get("/kyc/validate", {
    headers:{
      session_id
    }
  })
  .then(({ data }) => data)
  .catch((error) => {
    throw error;
  });
}