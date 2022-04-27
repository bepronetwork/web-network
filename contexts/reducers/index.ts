import { ChangeAccessToken } from "contexts/reducers/change-access-token";
import { ChangeGithubLogin } from "contexts/reducers/change-github-login";
import { ChangeMicroServiceReady } from "contexts/reducers/change-microservice-ready";
import { ChangeNetwork } from "contexts/reducers/change-network";
import { UpdateTransaction } from "contexts/reducers/update-transaction";

import { AddToast } from "./add-toast";
import { AddTransactions } from "./add-transaction";
import { ChangeBalance } from "./change-balance";
import { ChangeBeproInit } from "./change-bepro-init-state";
import { ChangeCurrentAddress } from "./change-current-address";
import { ChangeGithubHandle } from "./change-github-handle";
import { ChangeLoadState } from "./change-load-state";
import { ChangeMyIssuesState } from "./change-my-issues";
import { ChangeNetworkId } from "./change-network-id";
import { ChangeNetworksSummary } from "./change-networks-summary";
import { ChangeOraclesState } from "./change-oracles";
import { ChangeSettlerTokenApproval } from "./change-settler-token-approval";
import { ChangeStakedState } from "./change-staked-amount";
import { ChangeTransactionalTokenApproval } from "./change-transactional-token-approval";
import { ChangeWalletState } from "./change-wallet-connect";
import { addReducer } from "./main";
import { RemoveToast } from "./remove-toast";

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
    ChangeNetworkId,
    ChangeGithubLogin,
    ChangeAccessToken,
    ChangeTransactionalTokenApproval,
    ChangeSettlerTokenApproval,
    ChangeNetworksSummary
  ].forEach(addReducer);
}
