import DAO from "../services/dao-service";
import {Dispatch} from "react";
import {LoadingState} from "./loading-state";
import {ToastNotification} from "./toast-notification";
import {BlockTransaction, SimpleBlockTransactionPayload, UpdateBlockTransaction} from "./transaction";
import {SettingsType} from "../types/settings";
import {Network} from "./network";
import {ForkInfo, ForksList, ReposList} from "./repos-list";
import {BranchesList, BranchInfo} from "./branches-list";
import {XReducerAction} from "../contexts/reducers/reducer";
import {Balance} from "./balance-state";
import {IssueBigNumberData, IssueData, IssueDataComment} from "./issue-data";
import BigNumber from "bignumber.js";
import {BountyExtended} from "./bounty";

export interface ServiceNetworkReposActive {
  forks: ForkInfo[];
  branches: BranchInfo[];
  ghVisibility: boolean;
  id?: number;
}

export interface ServiceNetworkRepos {
  list: ReposList;
  forks: ForksList | null;
  branches: BranchesList | null;
  active: ServiceNetworkReposActive | null;
}

export interface ServiceNetwork {
  lastVisited: string;
  active: Network | null;
  repos: ServiceNetworkRepos | null;
}

export interface ServiceState {
  starting: boolean;
  microReady: boolean | null;
  active: DAO | null;
  network: ServiceNetwork | null;
}

export interface ConnectedChain {
  id: string;
  name: string
}

export interface CurrentUserState {
  handle: string;
  walletAddress: string;
  match?: boolean | undefined;
  balance?: Balance | null;
}

export interface CurrentBounty {
  comments: IssueDataComment[];
  lastUpdated: number;
  data: IssueBigNumberData;
  chainData: BountyExtended;
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