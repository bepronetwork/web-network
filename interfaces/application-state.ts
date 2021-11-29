import {LoadingState} from './loading-state';
import {OraclesState} from './oracles-state';
import {BalanceState} from './balance-state';
import {ToastNotification} from './toast-notification';
import {BlockTransaction, SimpleBlockTransactionPayload, Transaction, UpdateBlockTransaction} from './transaction'

export interface ApplicationState {
  githubHandle: string;
  metaMaskWallet: boolean;
  loading: LoadingState;
  beproInit: boolean;
  beproStaked: number;
  oracles: OraclesState;
  myIssues: number[];
  currentAddress: string;
  balance: BalanceState;
  toaster: ToastNotification[];
  microServiceReady: boolean|null;
  myTransactions: (SimpleBlockTransactionPayload|BlockTransaction|UpdateBlockTransaction)[];
  network: string;
  githubLogin: string;
  accessToken?: string;
  isTransactionalTokenApproved?: boolean;
  isSettlerTokenApproved?: boolean;
}
