import {ChangeWalletState} from './change-wallet-connect';
import {addReducer} from './main';
import {ChangeGithubHandle} from './change-github-handle';

export default function LoadApplicationReducers() {
  [
    ChangeWalletState,
    ChangeGithubHandle,

  ].forEach(addReducer);
}
