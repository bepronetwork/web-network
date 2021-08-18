import React, {createContext, Dispatch, useContext, useEffect, useReducer} from 'react';
import {mainReducer} from '@reducers/main';
import {ApplicationState} from '@interfaces/application-state';
import {ReduceActor} from '@interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import {BeproService} from '@services/bepro-service';
import {changeBeproInitState} from '@reducers/change-bepro-init-state';
import GithubMicroService from '../services/github-microservice';
import {useSession} from 'next-auth/client';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeCurrentAddress} from '@reducers/change-current-address'
import Loading from '../components/loading';
import Toaster from '../components/toaster';

interface GlobalState {
  state: ApplicationState,
  dispatch: (action: ReduceActor<any>) => Dispatch<ReduceActor<any>>,
}

const defaultState: GlobalState = {
  state: {
    githubHandle: ``,
    metaMaskWallet: false,
    currentAddress: ``,
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
    balance: {
      eth: 0,
      staked: 0,
      bepro: 0,
    },
    toaster: []
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState)

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const [session] = useSession();
  function onMetaMaskChange() {
    console.log(`onMetaMaskChange`, state.currentAddress, BeproService.address, state.currentAddress === BeproService.address)
    if (!state.metaMaskWallet || state.currentAddress === BeproService.address)
      return;

    GithubMicroService.getHandleOf(BeproService.address)
                      .then(handle => {
                        if (handle) dispatch(changeGithubHandle(handle))
                        else if(session?.user?.name) GithubMicroService.joinAddressToUser(session?.user?.name,{ address: BeproService.address})
                      });
  }

  function updateBeproLogin(newAddress) {
      BeproService.login(true)
                  .then(_ => { dispatch(changeCurrentAddress(newAddress)) })
                  .then(() => { onMetaMaskChange() });
  }

  function Initialize() {
    dispatch(changeBeproInitState(true) as any)

    if (!window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, (accounts) => updateBeproLogin(accounts[0]))
  }

  function setHandleIfConnected() {
    if (state.githubHandle)
      return;
    if (!session?.user?.name){
      dispatch(changeGithubHandle(``))
      return;
    }
    dispatch(changeGithubHandle(session.user.name));
  }

  LoadApplicationReducers();

  useEffect(Initialize, []);
  useEffect(onMetaMaskChange, [state.metaMaskWallet]);
  useEffect(setHandleIfConnected, [session]);

  return <ApplicationContext.Provider value={{state, dispatch: dispatch as any}}>
    <Loading show={state.loading.isLoading} text={state.loading.text} />
    <Toaster />
    {children}
  </ApplicationContext.Provider>
}
