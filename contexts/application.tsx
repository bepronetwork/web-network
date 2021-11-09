import React, {createContext, Dispatch, useContext, useEffect, useReducer} from 'react';
import {mainReducer} from '@reducers/main';
import {ApplicationState} from '@interfaces/application-state';
import {ReduceActor} from '@interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import {BeproService} from '@services/bepro-service';
import {changeBeproInitState} from '@reducers/change-bepro-init-state';
import {getSession, useSession} from 'next-auth/react';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeCurrentAddress} from '@reducers/change-current-address'
import Loading from '../components/loading';
import Toaster from '../components/toaster';
import {changeGithubLogin} from '@reducers/change-github-login';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import {changeBalance} from '@reducers/change-balance';
import {changeNetwork} from '@reducers/change-network';
import {useRouter} from 'next/router';
import {toastError} from '@reducers/add-toast';
import sanitizeHtml from 'sanitize-html';
import {GetServerSideProps} from 'next';
import {NetworkIds} from '@interfaces/enums/network-ids';
import useApi from '@x-hooks/use-api';
import {changeAccessToken} from '@reducers/change-access-token';

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
    accessToken: ``
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState)

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const { authError } = useRouter().query;
  const {getUserOf} = useApi();

  function updateSteFor(newAddress: string) {
    BeproService.login(true)
                .then(() =>  dispatch(changeCurrentAddress(newAddress)))
  }

  function onAddressChanged() {
    if (!state.currentAddress)
      return;

    const address = state.currentAddress;

    getUserOf(address)
                      .then(user => {
                        dispatch(changeGithubHandle(user?.githubHandle));
                        dispatch(changeGithubLogin(user?.githubLogin));
                        dispatch(changeAccessToken(user?.accessToken));
                      })

    BeproService.network.getOraclesSummary({address})
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(address, oracles))))

    BeproService.getBalance('bepro').then(bepro => dispatch(changeBalance({bepro})));
    BeproService.getBalance('eth').then(eth => dispatch(changeBalance({eth})));
    BeproService.getBalance('staked').then(staked => dispatch(changeBalance({staked})));
  }

  function Initialize() {
    BeproService.start()
                .then(state => {
                  dispatch(changeBeproInitState(state))
                });

    if (!window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, (accounts) => updateSteFor(accounts[0]))
    window.ethereum.on('chainChanged', (evt) => {
      dispatch(changeNetwork(NetworkIds[+evt?.toString()]?.toLowerCase()))
    })
  }

  LoadApplicationReducers();

  useEffect(Initialize, []);
  useEffect(onAddressChanged, [state.currentAddress]);
  useEffect(() => {
    if (!authError)
      return;

    dispatch(toastError(sanitizeHtml(authError, {allowedTags: [], allowedAttributes: {}})));
  }, [authError])

  return <ApplicationContext.Provider value={{state, dispatch: dispatch as any}}>
    <Loading show={state.loading.isLoading} text={state.loading.text}/>
    <Toaster/>
    {children}
  </ApplicationContext.Provider>
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {session: await getSession(ctx)},
  };
};
