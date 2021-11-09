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
import {ChangeMicroServiceReady} from '@reducers/change-microservice-ready';
import {AddTransactions} from './add-transaction';
import {UpdateTransaction} from '@reducers/update-transaction';
import {ChangeNetwork} from '@reducers/change-network';
import {ChangeGithubLogin} from '@reducers/change-github-login';
import {ChangeAccessToken} from '@reducers/change-access-token';

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
    ChangeMicroServiceReady,
    AddTransactions,
    UpdateTransaction,
    ChangeNetwork,
    ChangeGithubLogin,
    ChangeAccessToken,
  ].forEach(addReducer);
}
