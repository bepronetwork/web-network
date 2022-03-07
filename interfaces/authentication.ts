import { IBalance } from '@interfaces/balance-state'

export interface IUser {
  name?: string
  login?: string
  email?: string
  image?: string
  accessToken?: string
}

export interface IWallet {
  address: string
  balance: IBalance
}
