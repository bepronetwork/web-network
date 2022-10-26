import {createContext, useEffect, useReducer} from "react";

import {useRouter} from "next/router";
import sanitizeHtml from "sanitize-html";

import {AppState} from "../interfaces/application-state";
import {useAuthentication} from "../x-hooks/use-authentication";
import {useDao} from "../x-hooks/use-dao";
import {useNetwork} from "../x-hooks/use-network";
import {useRepos} from "../x-hooks/use-repos";
import {useSettings} from "../x-hooks/use-settings";
import loadApplicationStateReducers from "./reducers";
import {toastError} from "./reducers/change-toaster";
import {mainReducer} from "./reducers/main";


const appState: AppState = {
  state: {
    Settings: null,
    Service: null,
    loading: null,
    currentUser: null,
    connectedChain: null,
    currentBounty: null,
    show: {},
    spinners: {},
    transactions: [],
    toaster: [],
  },
  dispatch: () => undefined
};

export const AppStateContext = createContext(appState);

export default function AppStateContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, appState.state);

  const {query: {authError}} = useRouter();

  loadApplicationStateReducers(); // load reducers into app-state
  useSettings(); // loads settings from database and dispatches its state
  useDao(); // populate `state.Settings`
  useNetwork(); // start network state
  useAuthentication(); // github-connection, wallet & balance
  useRepos(); // load repos and hook to the query?.repoId param to load active repo

  function parseError() {
    if (!authError)
      return;

    dispatch(toastError(sanitizeHtml(authError, { allowedTags: [], allowedAttributes: {} })));
  }

  useEffect(parseError, [authError])

  // debug
  useEffect(() => { console.debug(`AppState Started`, new Date()) }, [])

  return <AppStateContext.Provider value={{state, dispatch: dispatch as any}}>
    {children}
  </AppStateContext.Provider>
}