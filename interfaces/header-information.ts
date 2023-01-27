import BigNumber from "bignumber.js";

export interface HeaderNetworksProps {
  bounties: number;
  number_of_network: number;
  TVL?: BigNumber;
  last_price_used: BigNumber[];
  createdAt: Date;
  updatedAt: Date;
}