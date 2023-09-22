import {api} from "../../../../../services/api";

export default async function useAddAllowListEntry(networkId: number, address: string) {
  return api.post<string[]>(`/network/management/${networkId}/whitelist/${address}`)
    .then(d => d.data);
}