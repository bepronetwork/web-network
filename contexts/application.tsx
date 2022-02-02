import React, {createContext, Dispatch, useEffect, useReducer, useState} from 'react';
import {mainReducer} from '@reducers/main';
import {ApplicationState} from '@interfaces/application-state';
import {ReduceActor} from '@interfaces/reduce-action';
import LoadApplicationReducers from './reducers';
import {BeproService} from '@services/bepro-service';
import {changeBeproInitState} from '@reducers/change-bepro-init-state';
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
import {NetworkIds} from '@interfaces/enums/network-ids';
import useApi from '@x-hooks/use-api';
import {changeAccessToken} from '@reducers/change-access-token';
import {updateTransaction} from '@reducers/update-transaction';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import { changeTransactionalTokenApproval } from './reducers/change-transactional-token-approval';
import { changeSettlerTokenApproval } from './reducers/change-settler-token-approval';
import {setCookie, parseCookies} from 'nookies'
import { addTransaction } from './reducers/add-transaction';
import { changeLoadState } from './reducers/change-load-state';

interface GlobalState {
  state: ApplicationState,
  methods?: any,
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
      oraclesDelegatedByOthers: 0,
      tokensLocked: 0
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
    accessToken: ``,
    isTransactionalTokenApproved: false,
    isSettlerTokenApproved: false
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
    BeproService.login()
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

    BeproService.isApprovedTransactionalToken().then(approval => dispatch(changeTransactionalTokenApproval(approval)))
    BeproService.isApprovedSettlerToken().then(approval => dispatch(changeSettlerTokenApproval(approval)))

    updateWalletBalance(address)
    
    cheatBepro = BeproService;
    cheatDispatcher = updateTransaction;
  }

  function updateWalletBalance(cheatAddress = undefined) {
    if (!state.currentAddress)
      return

    const address = cheatAddress || state.currentAddress
    
    BeproService.getOraclesSummary()
                .then(oracles => dispatch(changeOraclesState(changeOraclesParse(address, oracles))))

    BeproService.getBalance('bepro')
                .then(bepro => dispatch(changeBalance({bepro})))

    BeproService.getBalance('eth')
                .then(eth => dispatch(changeBalance({eth})))

    BeproService.getBalance('staked')
                .then(staked => dispatch(changeBalance({staked})))
  }

  const Initialize = () => {
    dispatch(changeLoadState(true))

    BeproService.start()
                .then((state) => {
                  dispatch(changeBeproInitState(state))
                }).finally(() => dispatch(changeLoadState(false)))

    if (!window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, (accounts) => updateSteFor(accounts[0]))
    window.ethereum.on('chainChanged', (evt) => {
      dispatch(changeNetwork((NetworkIds[+evt?.toString()] || `unknown`)?.toLowerCase()))
    });

    if (txListener)
      clearInterval(txListener)

    const web3 = (window as any).web3;

    const getPendingBlock = () => {
      if (!cheatAddress || !waitingForTx || !waitingForTx?.transactionHash) return

      web3.eth.getTransaction(waitingForTx.transactionHash).then(transaction => {  
        dispatch(updateTransaction({
          ...waitingForTx,
          addressFrom: transaction.from,
          addressTo: transaction.to,
          transactionHash: transaction.hash,
          blockHash: transaction.blockHash,
          confirmations: transaction?.nonce,
          status: transaction.blockNumber ? TransactionStatus.completed : TransactionStatus.pending
        }))
  
        if (transaction.blockNumber) waitingForTx = null
      })
    }

    setTxListener(setInterval(getPendingBlock, 1000))
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
    if (!waitingForTx)
      waitingForTx = state.myTransactions.find(({status}) => status === TransactionStatus.pending) || null;

    if(waitingForTx?.transactionHash) return

    const transactionWithHash = state.myTransactions.find(({id}) => id === waitingForTx?.id);

    if (!transactionWithHash || transactionWithHash?.status === TransactionStatus.failed)
      waitingForTx = null
    else
      waitingForTx = transactionWithHash

  }, [state.myTransactions])

  const restoreTransactions = async (address)=>{
    const cookie = parseCookies()
    const transactions = JSON.parse(cookie[`bepro.transactions:${address}`])
    const web3 = (window as any).web3;

    const getStatusFromBlock = async (tx) => {
      let transaction = {...tx}
      if(tx?.transactionHash){
        const block = await web3.eth.getTransaction(tx.transactionHash);
        if(block){
          transaction.addressFrom = block.from;
          transaction.addressTo = block.to,
          transaction.transactionHash = block.hash,
          transaction.blockHash = block.blockHash,
          transaction.confirmations = block?.nonce,
          transaction.status = block.blockNumber ? TransactionStatus.completed : TransactionStatus.pending
        }
      }
      
      dispatch(addTransaction(transaction))

      return transaction;
    }

    transactions.forEach(getStatusFromBlock)
  }


  useEffect(()=>{
    if (!state.currentAddress) return;
    if (state.myTransactions.length < 1) restoreTransactions(state.currentAddress)
    else {
      const value = JSON.stringify(state.myTransactions.slice(0, 5));
      setCookie(null, `bepro.transactions:${state.currentAddress}`, value, {
        maxAge: 24 * 60 * 60, // 24 hour
        path: "/",
      });
    }

  },[state.myTransactions, state.currentAddress])

  return (
    <ApplicationContext.Provider value={{ state, dispatch: dispatch as any }}>
      <Loading show={state.loading.isLoading} text={state.loading.text} />
      <Toaster />
      {children}
    </ApplicationContext.Provider>
  );
}