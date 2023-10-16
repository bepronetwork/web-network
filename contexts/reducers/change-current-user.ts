import {SimpleAction} from "contexts/reducers/reducer";

import {CurrentUserState, State} from "interfaces/application-state";
import {Balance} from "interfaces/balance-state";
import { MatchAccountsStatus } from "interfaces/enums/api";
import {AppStateReduceId} from "interfaces/enums/app-state-reduce-id";
import { kycSession } from "interfaces/kyc-session";

export class ChangeCurrentUser<T = CurrentUserState|Partial<CurrentUserState>> extends SimpleAction<T> {
  constructor(id = AppStateReduceId.CurrentUser) {
    super(id, 'currentUser');
  }

  reducer(state: State, payload: T): State {
    const transformed = {
      ...state.currentUser,
      ...payload,
    }

    return super.reducer(state, transformed);
  }
}

export const changeCurrentUser = new ChangeCurrentUser();

export const changeCurrentUserLogin = (login: string) =>
  changeCurrentUser.update({login});

export const changeCurrentUserId = (id: number) =>
  changeCurrentUser.update({id});  

export const changeCurrentUserWallet = (walletAddress: string) =>
  changeCurrentUser.update({walletAddress});

export const changeCurrentUserMatch = (match: MatchAccountsStatus | undefined) =>
  changeCurrentUser.update({match});

export const changeCurrentUserBalance = (balance: Balance | Partial<Balance>) =>
  changeCurrentUser.update({balance: balance as unknown as Balance});

export const changeCurrentUserConnected = (connected: boolean) =>
  changeCurrentUser.update({connected});

export const changeCurrentUserSignature = (signature: string) =>
  changeCurrentUser.update({signature});

export const changeCurrentUserisAdmin = (isAdmin: boolean) =>
  changeCurrentUser.update({isAdmin});

export const changeCurrentUserKycSession = (kycSession: kycSession) =>
  changeCurrentUser.update({kycSession});
