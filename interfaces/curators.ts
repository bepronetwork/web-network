import { Disputes } from "interfaces/issue-data";
import { Network } from "interfaces/network";
import { SupportedChainData } from "interfaces/supported-chain-data";

export interface Curator {
  address: string;
  acceptedProposals?: number;
  disputedProposals?: number;
  tokensLocked?: string;
  delegatedToMe?: string;
  networkId?: number;
  disputes?: Disputes[];
  isCurrentlyCurator?: boolean;
  delegations?: Delegation[];
  network?: Network;
}

export interface Delegation {
  from: string;
  to: string;
  amount: string;
  contractId: number;
  networkId: number;
  curatorId: number;
  chainId: number;
  network?: Network;
  curator?: Curator;
  chain?: SupportedChainData;
}

export interface SearchCuratorParams {
  page?: string;
  address?: string;
  isCurrentlyCurator?: boolean;
  networkName?: string;
  sortBy?: string;
  order?: string;
  chainShortName?: string;
}