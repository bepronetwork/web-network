import { HeaderNetworksProps } from "interfaces/header-information";

import { api } from "services/api";

export async function useGetHeaderNetworks() {
  return api
    .get<HeaderNetworksProps>(`/header/networks`)
    .then(({ data }) => ({
      totalConverted: data.TVL,
      numberOfBounties: data.bounties,
      numberOfNetworks: data.number_of_network,
    }))
    .catch((error) => {
      console.debug("Failed got header networks", error.toString());
      return {
        totalConverted: 0,
        numberOfBounties: 0,
        numberOfNetworks: 0,
      };
    });
}