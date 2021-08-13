import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ApplicationState} from '@interfaces/application-state';

const reducer = (state: ApplicationState, payload): ApplicationState =>
  ({...state, metaMaskWallet: payload})

export const ChangeWalletState: ReduceAction<boolean> = {
  name: ReduceActionName.MetaMaskWallet,
  fn: reducer
}

export const changeWalletState = (payload: boolean): ReduceActor<boolean> => ({name: ReduceActionName.MetaMaskWallet, payload});
