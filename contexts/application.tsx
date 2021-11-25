import React, {createContext, Dispatch, useEffect, useReducer, useState} from 'react';
import {mainReducer} from '@reducers/main';
import {ApplicationState} from '@interfaces/application-state';
import {ReduceActor} from '@interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import {BeproService} from '@services/bepro-service';
import {changeBeproInitState} from '@reducers/change-bepro-init-state';
import {getSession} from 'next-auth/react';
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
import {updateTransaction} from '@reducers/update-transaction';
import {TransactionStatus} from '@interfaces/enums/transaction-status';

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

export const ApplicationContext = createContext<GlobalState>(defaultState);

let cheatAddress = ``;
let waitingForTx = null;
let cheatBepro = null;
let cheatDispatcher = null;

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);
  const [txListener, setTxListener] = useState<any>();
  const {authError} = useRouter().query;
  const {getUserOf} = useApi();

  function updateSteFor(newAddress: string) {
    BeproService.login(true)
                .then(() => dispatch(changeCurrentAddress(newAddress)))
  }

  function onAddressChanged() {
    if (!state.currentAddress)
      return;

    const address = state.currentAddress;
    cheatAddress = address;

    getUserOf(address)
      .then(user => {
        dispatch(changeGithubHandle(user?.githubHandle));
        dispatch(changeGithubLogin(user?.githubLogin));
        dispatch(changeAccessToken(user?.accessToken));
      })

    BeproService.getOraclesSummary()
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(address, oracles))))

    BeproService.getBalance('bepro').then(bepro => dispatch(changeBalance({bepro})));
    BeproService.getBalance('eth').then(eth => dispatch(changeBalance({eth})));
    BeproService.getBalance('staked').then(staked => dispatch(changeBalance({staked})));
    cheatBepro = BeproService;
    cheatDispatcher = updateTransaction;
  }

  const Initialize = () => {
    BeproService.start()
                .then(state => {
                  dispatch(changeBeproInitState(state))
                });

    if (!window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, (accounts) => updateSteFor(accounts[0]))
    window.ethereum.on('chainChanged', (evt) => {
      dispatch(changeNetwork((NetworkIds[+evt?.toString()] || `unknown`)?.toLowerCase()))
    });

    if (txListener)
      txListener.unsubscribe((err, success) => { console.log(`unsub`, err, success); });

    const web3 = (window as any).web3;

    setTxListener(web3.eth.subscribe(`pendingTransactions`, error => {error && console.log(error)})
                      .on(`data`, (transactionHash) => {
                        if (!cheatAddress || !waitingForTx)
                          return;

                        const getTx = (txHash) => web3.eth.getTransaction(transactionHash)
                                                      .then(result => {
                                                        if (!result)
                                                          return getTx(transactionHash);
                                                        return {
                                                          ...waitingForTx,
                                                          addressFrom: result.from,
                                                          addressTo: result.to,
                                                          transactionHash: result.transactionHash || transactionHash,
                                                          blockHash: result.blockHash,
                                                          confirmations: result?.nonce,
                                                          status: TransactionStatus.pending,
                                                        }
                                                      })
                                                      .catch((error) => {
                                                        console.log(`Failed to getTransaction`, error);
                                                      })
                        getTx(transactionHash)
                            .then(tx => {
                              if (tx?.addressFrom === cheatAddress) {
                                dispatch(updateTransaction(tx));
                                waitingForTx = null;
                              }
                            })
                            .catch(_ => {
                              console.log(`Failed to subscribe to pastEvents`, _);
                            });
                      }))
  }

  LoadApplicationReducers();

  useEffect(Initialize, []);
  useEffect(onAddressChanged, [state.currentAddress]);
  useEffect(() => {
    if (!authError)
      return;

    dispatch(toastError(sanitizeHtml(authError, {allowedTags: [], allowedAttributes: {}})));
  }, [authError])

  useEffect(() => {
    if (waitingForTx)
      return;

    const pending = state.myTransactions.find(({status}) => status === 0);
    if (pending)
      waitingForTx = pending;

  }, [state.myTransactions])

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
