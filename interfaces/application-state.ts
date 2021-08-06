import {LoadingState} from './loading-state';
import {OraclesState} from './oracles-state';
import {BalanceState} from './balance-state';

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
}
