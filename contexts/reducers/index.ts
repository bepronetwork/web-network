import {ChangeWalletState} from './change-wallet-connect';
import {addReducer} from './main';
import {ChangeGithubHandle} from './change-github-handle';
import {ChangeLoadState} from './change-load-state';

export default function LoadApplicationReducers() {
  [
    ChangeWalletState,
    ChangeGithubHandle,
    ChangeLoadState,
  ].forEach(addReducer);
}
