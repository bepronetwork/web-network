import React, {createContext, Dispatch, useContext, useEffect, useReducer} from 'react';
import {mainReducer} from '@reducers/main';
import {ApplicationState} from '@interfaces/application-state';
import {ReduceActor} from '@interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import {BeproService} from '@services/bepro-service';
import {changeBeproInitState} from '@reducers/change-bepro-init-state';
import GithubMicroService from '../services/github-microservice';
import {getSession, useSession} from 'next-auth/react';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeCurrentAddress} from '@reducers/change-current-address'
import Loading from '../components/loading';
import Toaster from '../components/toaster';
import {changeGithubLogin} from '@reducers/change-github-login';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import {changeBalance} from '@reducers/change-balance';
import {useRouter} from 'next/router';
import {GetServerSideProps, GetStaticProps} from 'next';


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
    toaster: [],
    microServiceReady: null,
    myTransactions: [],
    network: ``,
    githubLogin: ``,
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState)

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const {data: session, status} = useSession();

  function updateSteFor(newAddress: string) {
    BeproService.login(true)
                .then(() =>  dispatch(changeCurrentAddress(newAddress)))
  }

  function onAddressChanged() {
    if (!state.currentAddress)
      return;

    const address = state.currentAddress;

    console.log( `address`, address);

    GithubMicroService.getUserOf(address)
                      .then(user => {
                        console.log(`got user`, user);
                        dispatch(changeGithubHandle(user?.githubHandle));
                        dispatch(changeGithubLogin(user?.githubLogin));
                      })

    BeproService.network.getOraclesSummary({address})
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(address, oracles))))

    BeproService.getBalance('bepro').then(bepro => dispatch(changeBalance({bepro})));
    BeproService.getBalance('eth').then(eth => dispatch(changeBalance({eth})));
    BeproService.getBalance('staked').then(staked => dispatch(changeBalance({staked})));
  }

  function Initialize() {
    dispatch(changeBeproInitState(true) as any)

    if (!window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, (accounts) => updateSteFor(accounts[0]))
  }

  LoadApplicationReducers();

  useEffect(Initialize, []);
  useEffect(onAddressChanged, [state.currentAddress]);
  useEffect(() => {
    console.log( `session`, session, status);
  }, [session, status]);

  return <ApplicationContext.Provider value={{state, dispatch: dispatch as any}}>
    <Loading show={state.loading.isLoading} text={state.loading.text}/>
    <Toaster/>
    {children}
  </ApplicationContext.Provider>
}
