import {createContext, useContext, useEffect, useReducer} from "react";

import {useRouter} from "next/router";
import sanitizeHtml from "sanitize-html";

import {AppState} from "../interfaces/application-state";
import {useAuthentication} from "../x-hooks/use-authentication";
import {useDao} from "../x-hooks/use-dao";
import {useNetwork} from "../x-hooks/use-network";
import {useRepos} from "../x-hooks/use-repos";
import {useSettings} from "../x-hooks/use-settings";
import loadApplicationStateReducers from "./reducers";
import {changeNetworkReposList} from "./reducers/change-service";
import {updateSettings} from "./reducers/change-settings";
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

export function AppStateContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, appState.state);
  const {query: {authError,}} = useRouter();
  const {loadSettings} = useSettings();
  const {loadRepos,} = useRepos();

  function parseError() {
    if (!authError)
      return;

    console.debug(`parsingError`, authError);
    dispatch(toastError(sanitizeHtml(authError, { allowedTags: [], allowedAttributes: {} })));
  }

  function start() {
    console.debug(`AppState first effect`, new Date());

    loadApplicationStateReducers(); // load reducers into app-state
    loadSettings()
      .then(s => dispatch(updateSettings(s)))
      .finally(() => {
        console.debug(`AppState Settings loaded`, new Date());
      });

  }

  function _loadRepos() {
    console.log('WEIRD', state?.Service?.network?.lastVisited);

    if (!state?.Service?.network?.lastVisited)
      return;

    loadRepos(true, state?.Service?.network?.lastVisited)
      .then(repos => dispatch(changeNetworkReposList(repos)));
  }

  useEffect(parseError, [authError])
  useEffect(start, [])
  useEffect(_loadRepos, [state?.Service?.network?.lastVisited])

  // useSettings(); // loads settings from database and dispatches its state
  useDao(); // populate `state.Settings`
  // useRepos(); // load repos and hook to the query?.repoId param to load active repo
  useNetwork(); // start network state
  useAuthentication(); // github-connection, wallet & balance


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