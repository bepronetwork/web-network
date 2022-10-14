import {
  createContext,
  Dispatch,
  useEffect,
  useReducer,
  useState
} from "react";

import { useRouter } from "next/router";
import sanitizeHtml from "sanitize-html";

import Loading from "components/loading";
import Toaster from "components/toaster";

import { toastError } from "contexts/reducers/add-toast";

import loadApplicationStateReducers from "contexts/reducers/index";
import { mainReducer } from "contexts/reducers/main";


import { ApplicationState } from "interfaces/application-state";

import { ReduceActor } from "interfaces/reduce-action";


interface GlobalState {
  state: ApplicationState;
  dispatch: (action: ReduceActor<any>) => Dispatch<ReduceActor<any>>; // eslint-disable-line
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
    toaster: [],
    microServiceReady: null,
    myTransactions: [],
    network: "",
    networkId: null,
    githubLogin: "",
    accessToken: "",
    isTransactionalTokenApproved: false,
    isSettlerTokenApproved: false,
    networksSummary: {
      bounties: 0,
      amountInNetwork: 0,
      amountDistributed: 0
    },
    showCreateBounty: false,
    showWeb3Dialog: false
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState);

export default function ApplicationContextProvider({ children }) {
  const [, dispatch] = useReducer(() => {}, null);

  const {
    query: { authError },
  } = useRouter();



  loadApplicationStateReducers();

  return (
    <ApplicationContext.Provider value={{ 
                                         state, 
                                         dispatch: dispatch as any } // eslint-disable-line
                                       }>
      <Loading show={state.loading.isLoading} text={state.loading.text} />
      <Toaster />
      {children}
    </ApplicationContext.Provider>
  );
}
