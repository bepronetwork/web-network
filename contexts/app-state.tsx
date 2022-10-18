import {createContext, useEffect, useReducer} from "react";
import {mainReducer} from "./reducers/main";
import loadApplicationStateReducers from "./reducers";
import {AppState} from "../interfaces/application-state";
import sanitizeHtml from "sanitize-html";
import {useRouter} from "next/router";
import {toastError} from "./reducers/change-toaster";
import {useSettings} from "../x-hooks/use-settings";
import {useDao} from "../x-hooks/use-dao";
import {useNetwork} from "../x-hooks/use-network";
import {useAuthentication} from "../x-hooks/use-authentication";
import {useRepos} from "../x-hooks/use-repos";


const appState: AppState = {
  state: {
    Settings: null,
    Service: null,
    loading: null,
    currentUser: null,
    connectedChain: null,
    show: {},
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

  return <AppStateContext.Provider value={{state, dispatch: dispatch as any}}>
    {children}
  </AppStateContext.Provider>
}