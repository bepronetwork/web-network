import {createContext, Dispatch, useContext, useEffect, useReducer} from 'react';
import {mainReducer} from './reducers/main';
import {ApplicationState} from '../interfaces/application-state';
import {ReduceActor} from '../interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import BeproService from '../services/bepro';
import {changeBeproInitState} from './reducers/change-bepro-init-state';
import GithubMicroService from '../services/github-microservice';
import {useSession} from 'next-auth/client';
import {changeGithubHandle} from './reducers/change-github-handle';

interface GlobalState {
  state: ApplicationState,
  dispatch: (action: ReduceActor<any>) => Dispatch<ReduceActor<any>>,
}

const defaultState: GlobalState = {
  state: {
    githubHandle: ``,
    metaMaskWallet: false,
    loading: {
      isLoading: false,
    },
    beproInit: false,
    beproStaked: 0,
    oracles: {
      addresses: [],
      amounts: [],
      oraclesDelegatedByOthers: ``,
      tokensLocked: ``
    },
    myIssues: [],
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState)

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const [session,] = useSession();

  function Initialize() {
    BeproService.init()
                .then(() => dispatch(changeBeproInitState(true) as any));
  }

  function onMetaMaskChange() {
    console.log(`meta changed`, state);
    if (state.metaMaskWallet)
      GithubMicroService.getHandleOf(BeproService.address)
                        .then(handle => {
                          if (!handle && session?.user?.name)
                            GithubMicroService.joinAddressToHandle({
                                                                            githubHandle: session.user.name,
                                                                            address: BeproService.address
                                                                          })
                                                     .then(() => dispatch(changeGithubHandle(session.user.name)));
                          else dispatch(changeGithubHandle(handle));
                        });
  }

  function setHandleIfConnected() {
    if (state.githubHandle)
      return;

    if (!session?.user?.name)
      return;

    dispatch(changeGithubHandle(session.user.name));
  }

  LoadApplicationReducers();

  useEffect(Initialize, []);
  useEffect(onMetaMaskChange, [state.metaMaskWallet]);
  useEffect(setHandleIfConnected, [session]);

  return <ApplicationContext.Provider
    value={{state, dispatch: dispatch as any}}>{children}</ApplicationContext.Provider>
}
