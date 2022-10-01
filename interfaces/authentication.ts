import { Balance } from "interfaces/balance-state";

export interface User {
  name?: string;
  login?: string;
  email?: string;
  image?: string;
  accessToken?: string;
}

export interface Repository {
  name: string;
  nameWithOwner: string;
  isFork: boolean;
  isInOrganization?: boolean;
}

export interface Wallet {
  address: string;
  isCouncil: boolean;
  isNetworkGovernor: boolean;
  balance?: Balance;
}

