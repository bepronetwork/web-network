import {ChangeWalletState} from './change-wallet-connect';
import {addReducer} from './main';
import {ChangeGithubHandle} from './change-github-handle';
import {ChangeLoadState} from './change-load-state';
import {ChangeBeproInit} from './change-bepro-init-state';
import {ChangeMyIssuesState} from './change-my-issues';
import {ChangeOraclesState} from './change-oracles';
import {ChangeStakedState} from './change-staked-amount';

export default function LoadApplicationReducers() {
  [
    ChangeWalletState,
    ChangeGithubHandle,
    ChangeLoadState,
    ChangeBeproInit,
    ChangeMyIssuesState,
    ChangeOraclesState,
    ChangeStakedState,
  ].forEach(addReducer);
}
