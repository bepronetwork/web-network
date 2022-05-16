import { IBalance } from "interfaces/balance-state";

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
  isOrganization?: boolean;
}

export interface Wallet {
  address: string;
  isCouncil: boolean;
  balance?: IBalance;
}

