import { LoadingState } from "./loading-state";
import { OraclesState } from "./oracles-state";
import { ToastNotification } from "./toast-notification";
import {
  BlockTransaction,
  SimpleBlockTransactionPayload,
  UpdateBlockTransaction
} from "./transaction";

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
  myTransactions: (
    | SimpleBlockTransactionPayload
    | BlockTransaction
    | UpdateBlockTransaction
  )[];
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
