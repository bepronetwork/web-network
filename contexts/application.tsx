import React, {
  createContext,
  Dispatch,
  useEffect,
  useReducer,
  useState
} from "react";

import Loading from "components/loading";
import Toaster from "components/toaster";
import { useAuthentication } from "contexts/authentication";
import { handleNetworkAddress } from "helpers/custom-network";
import { ApplicationState } from "interfaces/application-state";
import { NetworkIds } from "interfaces/enums/network-ids";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { ReduceActor } from "interfaces/reduce-action";
import { toastError } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { changeBeproInitState } from "contexts/reducers/change-bepro-init-state";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { changeNetwork } from "contexts/reducers/change-network";
import LoadApplicationReducers from "contexts/reducers/index";
import { mainReducer } from "contexts/reducers/main";
import { updateTransaction } from "contexts/reducers/update-transaction";
import { BeproService } from "services/bepro-service";
import { useRouter } from "next/router";
import { setCookie, parseCookies } from "nookies";
import sanitizeHtml from "sanitize-html";

import { useNetwork } from "contexts/network";

import { changeStakedState } from "./reducers/change-staked-amount";

interface GlobalState {
  state: ApplicationState;
  methods?: any;
  dispatch: (action: ReduceActor<any>) => Dispatch<ReduceActor<any>>;
}

const defaultState: GlobalState = {
  state: {
    githubHandle: "",
    metaMaskWallet: false,
    currentAddress: "",
    loading: {
      isLoading: false
    },
    beproInit: false,
    beproStaked: 0,
    oracles: {
      addresses: [],
      amounts: [],
      oraclesDelegatedByOthers: 0,
      tokensLocked: 0
    },
    myIssues: [],
    balance: {
      eth: 0,
      staked: 0,
      bepro: 0
    },
    toaster: [],
    microServiceReady: null,
    myTransactions: [],
    network: "",
    githubLogin: "",
    accessToken: "",
    isTransactionalTokenApproved: false,
    isSettlerTokenApproved: false,
    networksSummary: {
      bounties: 0,
      amountInNetwork: 0,
      amountDistributed: 0
    }
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState);

const cheatAddress = "";
let waitingForTx = null;
const cheatBepro = null;
const cheatDispatcher = null;

export default function ApplicationContextProvider({ children }) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const [txListener, setTxListener] = useState<any>();
  const {
    query: { authError },
    pathname
  } = useRouter();

  const { activeNetwork } = useNetwork();
  const { wallet, beproServiceStarted } = useAuthentication();

  const Initialize = () => {
    if (!activeNetwork) return;

    dispatch(changeLoadState(true));

    BeproService.start(handleNetworkAddress(activeNetwork))
      .then((state) => {
        dispatch(changeBeproInitState(state));
      })
      .finally(() => dispatch(changeLoadState(false)));

    if (!window.ethereum) return;

    window.ethereum.on("chainChanged", (evt) => {
      dispatch(
        changeNetwork(
          (NetworkIds[+evt?.toString()] || "unknown")?.toLowerCase()
        )
      );
    });

    if (txListener) clearInterval(txListener);

    const web3 = (window as any).web3;

    const getPendingBlock = () => {
      if (!cheatAddress || !waitingForTx || !waitingForTx?.transactionHash)
        return;

      web3.eth
        .getTransaction(waitingForTx.transactionHash)
        .then((transaction) => {
          dispatch(
            updateTransaction({
              ...waitingForTx,
              addressFrom: transaction.from,
              addressTo: transaction.to,
              transactionHash: transaction.hash,
              blockHash: transaction.blockHash,
              confirmations: transaction?.nonce,
              status: transaction.blockNumber
                ? TransactionStatus.completed
                : TransactionStatus.pending
            })
          );

          if (transaction.blockNumber) waitingForTx = null;
        });
    };

    setTxListener(setInterval(getPendingBlock, 1000));
  };

  LoadApplicationReducers();

  useEffect(Initialize, [activeNetwork]);
  useEffect(() => {
    if (!authError) return;

    dispatch(
      toastError(
        sanitizeHtml(authError, { allowedTags: [], allowedAttributes: {} })
      )
    );
  }, [authError]);

  useEffect(() => {
    if (!waitingForTx)
      waitingForTx =
        state.myTransactions.find(
          ({ status }) => status === TransactionStatus.pending
        ) || null;

    if (waitingForTx?.transactionHash) return;

    const transactionWithHash = state.myTransactions.find(
      ({ id }) => id === waitingForTx?.id
    );

    if (
      !transactionWithHash ||
      transactionWithHash?.status === TransactionStatus.failed
    )
      waitingForTx = null;
    else waitingForTx = transactionWithHash;
  }, [state.myTransactions]);

  useEffect(() => {
    if (beproServiceStarted)
      BeproService.getBeproLocked()
        .then((amount) => dispatch(changeStakedState(amount)))
        .catch(console.log);
  }, [pathname, beproServiceStarted]);

  const restoreTransactions = async (address) => {
    const cookie = parseCookies();
    const transactions = JSON.parse(
      cookie[`bepro.transactions:${address}`]
        ? cookie[`bepro.transactions:${address}`]
        : "[]"
    );
    const web3 = (window as any).web3;

    const getStatusFromBlock = async (tx) => {
      const transaction = { ...tx };
      if (tx?.transactionHash) {
        const block = await web3.eth.getTransaction(tx.transactionHash);
        if (block) {
          transaction.addressFrom = block.from;
          (transaction.addressTo = block.to),
            (transaction.transactionHash = block.hash),
            (transaction.blockHash = block.blockHash),
            (transaction.confirmations = block?.nonce),
            (transaction.status = block.blockNumber
              ? TransactionStatus.completed
              : TransactionStatus.pending);
        }
      }

      dispatch(addTransaction(transaction, activeNetwork));

      return transaction;
    };

    transactions.forEach(getStatusFromBlock);
  };

  useEffect(() => {
    if (!wallet?.address) return;

    if (state.myTransactions.length < 1)
      restoreTransactions(wallet?.address?.toLowerCase());
    else {
      const value = JSON.stringify(state.myTransactions.slice(0, 5));
      setCookie(
        null,
        `bepro.transactions:${wallet?.address.toLowerCase()}`,
        value,
        {
          maxAge: 24 * 60 * 60, // 24 hour
          path: "/"
        }
      );
    }
  }, [state.myTransactions, wallet]);

  return (
    <ApplicationContext.Provider value={{ state, dispatch: dispatch as any }}>
      <Loading show={state.loading.isLoading} text={state.loading.text} />
      <Toaster />
      {children}
    </ApplicationContext.Provider>
  );
}
