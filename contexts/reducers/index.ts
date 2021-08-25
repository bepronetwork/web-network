import {ChangeWalletState} from './change-wallet-connect';
import {addReducer} from './main';
import {ChangeGithubHandle} from './change-github-handle';
import {ChangeLoadState} from './change-load-state';
import {ChangeBeproInit} from './change-bepro-init-state';
import {ChangeMyIssuesState} from './change-my-issues';
import {ChangeOraclesState} from './change-oracles';
import {ChangeStakedState} from './change-staked-amount';
import {ChangeCurrentAddress} from './change-current-address';
import {ChangeBalance} from './change-balance';
import {AddToast} from './add-toast';
import {RemoveToast} from './remove-toast';
import {AddTransactions} from './add-transactions'

export default function LoadApplicationReducers() {
  [
    ChangeWalletState,
    ChangeGithubHandle,
    ChangeLoadState,
    ChangeBeproInit,
    ChangeMyIssuesState,
    ChangeOraclesState,
    ChangeStakedState,
    ChangeCurrentAddress,
    ChangeBalance,
    AddToast,
    RemoveToast,
    AddTransactions
  ].forEach(addReducer);
}
