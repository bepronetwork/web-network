import { User } from "interfaces/api";

import { api } from "services/api";

export async function useGetUserByAddress(address: string): Promise<User> {
  return api
    .post<User>("/search/users/address/", [address])
    .then(({ data }) => data[0]);
}