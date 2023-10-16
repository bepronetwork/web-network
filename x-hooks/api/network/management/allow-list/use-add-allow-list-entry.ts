import {api} from "../../../../../services/api";

export default async function useAddAllowListEntry(networkId: number, address: string, networkAddress: string) {
  return api.post<string[]>(`/network/management/${networkId}/whitelist/${address}`, {
    networkAddress
  })
    .then(d => d.data);
}