import { api } from "services/api";

export async function useGetSettings() {
  return api.get("/settings")
    .then((({ data }) => data));
}