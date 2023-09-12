import {api} from "../../../../../services/api";

export default function useGetAllowList(networkId: string) {
  return api.get<string[]>(`/network/management/${networkId}/whitelist/`)
    .then(d => d.data);
}