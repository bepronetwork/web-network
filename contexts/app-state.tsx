import {createContext, useContext, useEffect, useReducer} from "react";

import {useRouter} from "next/router";
import sanitizeHtml from "sanitize-html";

import {AppState} from "../interfaces/application-state";
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
    supportedChains: null
  },
  dispatch: () => undefined
};

export const AppStateContext = createContext(appState);

export function AppStateContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, appState.state);
  const {query: {authError,}} = useRouter();


  function parseError() {
    if (!authError)
      return;

    console.debug(`Error parsing`, authError);
    dispatch(toastError(sanitizeHtml(authError, { allowedTags: [], allowedAttributes: {} })));
  }

  useEffect(parseError, [authError])
  useEffect(loadApplicationStateReducers, [])

  return <AppStateContext.Provider value={{state, dispatch: dispatch as unknown as any}}>
    {children}
  </AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context)
    throw new Error(`useAppState not inside AppStateContext`);

  return context;
}