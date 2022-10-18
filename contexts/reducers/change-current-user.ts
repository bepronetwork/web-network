import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {CurrentUserState, State} from "../../interfaces/application-state";
import {Balance} from "../../interfaces/balance-state";


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

export const changeCurrentUserHandle = (handle: string) =>
  changeCurrentUser.update({handle});

export const changeCurrentUserWallet = (walletAddress: string) =>
  changeCurrentUser.update({walletAddress});

export const changeCurrentUserMatch = (match: boolean | undefined) =>
  changeCurrentUser.update({match});

export const changeCurrentUserBalance = (balance: Balance | Partial<Balance>) =>
  changeCurrentUser.update({balance: balance as any as Balance});