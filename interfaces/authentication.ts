import { IBalance } from "interfaces/balance-state";

export interface User {
  name?: string;
  login?: string;
  email?: string;
  image?: string;
  accessToken?: string;
  repositories?: IRepository[];
}

export interface IRepository {
  name: string;
  nameWithOwner: string;
  isFork: boolean;
}

export interface Repository {
  name: string;
  nameWithOwner: string;
  isFork: boolean;
}

export interface Wallet {
  address: string;
  isCouncil: boolean;
  isApprovedSettlerToken: boolean;
  balance?: IBalance;
}

