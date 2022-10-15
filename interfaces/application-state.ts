import { LoadingState } from "./loading-state";
import { OraclesState } from "./oracles-state";
import { ToastNotification } from "./toast-notification";
import {
  BlockTransaction,
  SimpleBlockTransactionPayload,
  UpdateBlockTransaction
} from "./transaction";
import {SettingsType} from "../types/settings";
import DAO from "../services/dao-service";
import {Network} from "./network";
import {ForkInfo, ForksList, ReposList} from "./repos-list";
import {BranchesList, BranchInfo} from "./branches-list";

import {Dispatch} from "react";
import {XReducerAction} from "../contexts/reducers/reducer";

export interface ApplicationState {
  githubHandle: string;
  metaMaskWallet: boolean;
  loading: LoadingState;
  beproInit: boolean;
  beproStaked: number;
  oracles: OraclesState;
  myIssues: number[];
  currentAddress: string;
  toaster: ToastNotification[];
  microServiceReady: boolean | null;
  transactions: (| SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction)[];
  network: string;
  networkId: number;
  githubLogin: string;
  accessToken?: string;
  isTransactionalTokenApproved?: boolean;
  isSettlerTokenApproved?: boolean;
  networksSummary?: NetworksSummary;
  showCreateBounty?: boolean;
  showWeb3Dialog?: boolean;
}

export interface NetworksSummary {
  bounties: number;
  amountInNetwork: number;
  amountDistributed: number;
}

export interface ChangeNetworkSummaryProps {
  label?: "bounties" | "amountInNetwork" | "amountDistributed";
  amount?: number;
  action?: "add" | "reset";
}

export interface ServiceNetworkRepostActive {
  forks: ForkInfo[];
  branches: BranchInfo[];
  ghVisibility: boolean;
}

export interface ServiceNetworkRepos {
  list: ReposList;
  forks: ForksList | null;
  branches: BranchesList | null;
  active: ServiceNetworkRepostActive | null;
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

export interface State {
  Settings: SettingsType | null;
  Service: ServiceState | null,
  loading: LoadingState | null;
  toaster: ToastNotification[];
  transactions: (SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction)[];
  currentUser: { handle: string; walletAddress: string; } | null,
  connectedChain: ConnectedChain | null,
  show: {
    [key: string]: boolean;
  }
}

export interface AppState {
  state: State,
  dispatch: (action: XReducerAction<any>) => Dispatch<XReducerAction<any>>;
}