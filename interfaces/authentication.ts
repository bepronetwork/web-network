import { Balance } from "interfaces/balance-state";

export interface Wallet {
  address: string;
  isCouncil: boolean;
  isNetworkGovernor: boolean;
  balance?: Balance;
}

