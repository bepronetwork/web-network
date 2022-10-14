import {createContext, useEffect, useReducer} from "react";
import {mainReducer} from "./reducers/main";
import loadApplicationStateReducers from "./reducers";
import {AppState} from "../interfaces/application-state";
import sanitizeHtml from "sanitize-html";
import {useRouter} from "next/router";
import {toastError} from "./reducers/change-toaster";


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

  loadApplicationStateReducers();

  useEffect(() => {
    if (!authError)
      return;

    dispatch(toastError(sanitizeHtml(authError, { allowedTags: [], allowedAttributes: {} })));

  }, [authError])

  return <AppStateContext.Provider value={{state, dispatch: dispatch as any}}>
    {children}
  </AppStateContext.Provider>
}