import {Dispatch} from "react";

import {TreasuryInfo} from "@taikai/dappkit";

import {XReducerAction} from "contexts/reducers/reducer";

import {Balance} from "interfaces/balance-state";
import {BountyExtended} from "interfaces/bounty";
import {BranchesList} from "interfaces/branches-list";
import {IssueBigNumberData, IssueDataComment} from "interfaces/issue-data";
import {LoadingState} from "interfaces/loading-state";
import {Network} from "interfaces/network";
import {ForkInfo, ForksList, RepoInfo, ReposList} from "interfaces/repos-list";
import {SupportedChainData} from "interfaces/supported-chain-data";
import {ToastNotification} from "interfaces/toast-notification";
import {Token} from "interfaces/token";
import {BlockTransaction, SimpleBlockTransactionPayload, UpdateBlockTransaction} from "interfaces/transaction";

import DAO from "services/dao-service";

import {SettingsType} from "types/settings";

export interface ServiceNetworkReposActive extends RepoInfo {
  forks?: ForkInfo[];
  branches?: string[];
  ghVisibility?: boolean;
  githubPath: string;
  branchProtectionRules?: any;
  viewerPermission?: string;
  id: number;
}

export interface ServiceNetworkRepos {
  list: ReposList;
  forks: ForksList | null;
  branches: BranchesList | null;
  active: ServiceNetworkReposActive | null;
}

export interface NetworkTimes {
  disputableTime: string|number;
  draftTime: string|number;
}

export interface NetworkAmounts {
  councilAmount: string | number;
  mergeCreatorFeeShare: string | number;
  proposerFeeShare: string | number;
  percentageNeededForDispute: string | number;
  oracleExchangeRate: string | number;
  treasury: TreasuryInfo;
  totalNetworkToken: string | number;
}

export interface ServiceNetwork {
  lastVisited: string;
  active: Network | null;
  repos: ServiceNetworkRepos | null;
  times: NetworkTimes;
  amounts: NetworkAmounts;
  noDefaultNetwork?: boolean;
  availableChains?: SupportedChainData[];
  tokens: {transactional: Token[]; reward: Token[];} | null;
}

export interface ServiceState {
  starting: boolean;
  microReady: boolean | null;
  active: DAO | null;
  network: ServiceNetwork | null;
}

export interface ConnectedChain {
  id: string;
  name: string;
  shortName: string;
  explorer?: string;
  events?: string;
  registry?: string;
  matchWithNetworkChain?: boolean;
}

export interface CurrentUserState {
  handle: string;
  walletAddress: string;
  match?: boolean | undefined;
  balance?: Balance | null;
  login?: string;
  accessToken?: string;
  connected?: boolean;
  signature?: string;
  isAdmin?: boolean;
  hasRegisteredNetwork?: boolean;
}

export interface CurrentBounty {
  comments: IssueDataComment[];
  lastUpdated: number;
  data: IssueBigNumberData;
}

export interface State {
  Settings: SettingsType | null;
  Service: ServiceState | null,
  loading: LoadingState | null;
  toaster: ToastNotification[];
  transactions: (SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction)[];
  currentUser: CurrentUserState | null,
  connectedChain: ConnectedChain | null,
  currentBounty: CurrentBounty | null,
  supportedChains: SupportedChainData[] | null,
  show: {
    [key: string]: boolean;
  }
  spinners: {
    [key: string]: boolean;
  }
}

export interface AppState {
  state: State,
  dispatch: (action: XReducerAction<any>) => Dispatch<XReducerAction<any>>;
}