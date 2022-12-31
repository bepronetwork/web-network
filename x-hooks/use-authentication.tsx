import {useState} from "react";

import BigNumber from "bignumber.js";
import {signIn, signOut, useSession} from "next-auth/react";
import getConfig from "next/config";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {
  changeCurrentUser,
  changeCurrentUserAccessToken,
  changeCurrentUserBalance,
  changeCurrentUserHandle,
  changeCurrentUserLogin,
  changeCurrentUserMatch,
  changeCurrentUserWallet,
  changeCurrentUserKycSession
} from "contexts/reducers/change-current-user";
import {changeActiveNetwork} from "contexts/reducers/change-service";
import {changeConnectingGH, changeSpinners, changeWalletSpinnerTo} from "contexts/reducers/change-spinners";
import { changeReAuthorizeGithub } from "contexts/reducers/update-show-prop";

import {CustomSession} from "interfaces/custom-session";
import { kycSession } from "interfaces/kyc-session";

import {WinStorage} from "services/win-storage";

import useApi from "x-hooks/use-api";
import {useDao} from "x-hooks/use-dao";
import { useTransactions } from "x-hooks/use-transactions";

export const SESSION_EXPIRATION_KEY =  "next-auth.expiration";

const {publicRuntimeConfig} = getConfig()

export function useAuthentication() {

  const session = useSession();
  const {state, dispatch} = useAppState();
  const {connect} = useDao();
  const transactions = useTransactions();

  const {asPath, push} = useRouter();
  const {getUserOf, getUserWith, searchCurators, getKycSession, validateKycSession} = useApi();

  const [lastUrl,] = useState(new WinStorage('lastUrlBeforeGHConnect', 0, 'sessionStorage'));
  const [balance,] = useState(new WinStorage('currentWalletBalance', 1000, 'sessionStorage'));

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${ window.location.host}` : "";

  function disconnectGithub() {
    dispatch(changeCurrentUserMatch(undefined));
    dispatch(changeCurrentUserHandle(undefined));
    dispatch(changeCurrentUserLogin(undefined));
    dispatch(changeCurrentUserAccessToken((undefined)));
    return signOut({redirect: false});
  }

  function disconnectWallet() {

    if (!state.currentUser?.walletAddress)
      return;

    transactions.deleteFromStorage();
    
    const lastNetwork = state.Service?.network?.lastVisited === "undefined" ? "" : state.Service?.network?.lastVisited;
    
    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);
    
    expirationStorage.removeItem();

    signOut({callbackUrl: `${URL_BASE}/${lastNetwork}`})
      .then(() => {
        dispatch(changeCurrentUser.update({handle: state.currentUser?.handle, walletAddress: ''}));
      });
  }

  function connectWallet() {
    if (!state.Service?.active)
      return;

    connect();
  }

  function updateWalletAddress() {
    if (state.spinners?.wallet)
      return;

    if (!state.currentUser?.connected)
      return;

    dispatch(changeWalletSpinnerTo(true));

    state.Service.active.getAddress()
      .then(address => {
        if (address !== state.currentUser?.walletAddress)
          dispatch(changeCurrentUserWallet(address))
        sessionStorage.setItem(`currentWallet`, address);
      })
      .catch(e => {
        console.error(`Error getting address`, e);
      })
      .finally(() => {
        dispatch(changeWalletSpinnerTo(false));
      })

  }

  function connectGithub() {
    console.debug(`connectGithub`, state.currentUser)

    if (!state.currentUser?.walletAddress)
      return;

    dispatch(changeConnectingGH(true));

    getUserOf(state.currentUser?.walletAddress)
      .then((user) => {
        if (!user?.githubLogin && !asPath.includes(`connect-account`)) {
          disconnectGithub()
          push(`/connect-account`);
          return false;
        }
        return true;
      })
      .then(signedIn => {
        if (!signedIn)
          return dispatch(changeConnectingGH(false))

        lastUrl.value = asPath;
        
        if(signedIn)
          signIn('github', {callbackUrl: `${URL_BASE}${asPath}`})

        return setTimeout(() => dispatch(changeConnectingGH(false)), 5 * 1000)
      })
  }

  function validateGhAndWallet() {
    const sessionUser = (session?.data as CustomSession)?.user;
    
    if (!state.currentUser?.walletAddress || !sessionUser?.login || state.spinners?.matching)
      return;

    dispatch(changeSpinners.update({matching: true}));

    const userLogin = sessionUser.login;
    const walletAddress = state.currentUser.walletAddress.toLowerCase();

    getUserWith(userLogin)
      .then(async(user) => {
        if (!user.githubLogin){
          dispatch(changeCurrentUserMatch(undefined));

          if(session.status === 'authenticated' && state.currentUser.login && !asPath.includes(`connect-account`)){
            await disconnectGithub()
          }
        }
        else if (user.githubLogin && userLogin)
          dispatch(changeCurrentUserMatch(userLogin === user.githubLogin &&
            (walletAddress ? walletAddress === user.address : true)));

      })
      .finally(() => {
        dispatch(changeSpinners.update({matching: false}));
      })
  }

  function listenToAccountsChanged() {
    if (!state.Service || !window.ethereum)
      return;

    window.ethereum.on(`accountsChanged`, () => {
      connect();
    });
  }

  function updateWalletBalance(force = false) {
    if ((!force && (balance.value || !state.currentUser?.walletAddress)) || !state.Service?.active?.network)
      return;

    const update = newBalance => {
      const newState = Object.assign(state.currentUser.balance || {}, newBalance);
      dispatch(changeCurrentUserBalance(newState));
      balance.value = newState;
    }

    const updateNetwork = newParameters =>
      dispatch(changeActiveNetwork(Object.assign(state.Service.network.active || {} as any, newParameters)));

    dispatch(changeSpinners.update({balance: true}))

    Promise.all([
      state.Service.active.getOraclesResume(state.currentUser.walletAddress),

      state.Service.active.getBalance('settler', state.currentUser.walletAddress),
      searchCurators({ address: state.currentUser.walletAddress, networkName: state.Service?.network?.active?.name })
      .then(v => v?.rows[0]?.tokensLocked || 0).then(value => new BigNumber(value)),
      // not balance, but related to address, no need for a second useEffect()
      state.Service.active.isCouncil(state.currentUser.walletAddress),
      state.Service.active.isNetworkGovernor(state.currentUser.walletAddress)
    ])
      .then(([oracles, bepro, staked, isCouncil, isGovernor]) => {
        update({oracles, bepro, staked});
        updateNetwork({isCouncil, isGovernor});
      })
      .finally(() => {
        dispatch(changeSpinners.update({balance: false}));
        console.debug(`should have updated state`, state.currentUser.balance)
      })
  }

  function updateCurrentUserLogin() {
    const sessionUser = (session?.data as CustomSession)?.user;

    if (!sessionUser || state.currentUser?.login === sessionUser?.login ||
      sessionUser.accessToken === state.currentUser?.accessToken)
      return;

    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);

    expirationStorage.value =  session.data.expires;

    dispatch(changeCurrentUserHandle(session.data.user.name));
    dispatch(changeCurrentUserLogin(sessionUser.login));
    dispatch(changeCurrentUserAccessToken((sessionUser.accessToken)));
  }

  function verifyReAuthorizationNeed() {
    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);

    dispatch(changeReAuthorizeGithub(!!expirationStorage.value && new Date(expirationStorage.value) < new Date()));
  }

  function updateKycSession(){
    if(!state?.currentUser?.login 
        || !state?.currentUser?.accessToken
        || !state?.currentUser?.walletAddress 
        || publicRuntimeConfig.kyc.isEnabled !== 'true') 
      return

    getKycSession()
      .then((data: kycSession) => data.status !== 'VERIFIED' ? validateKycSession(data.session_id) : data)
      .then((session)=> dispatch(changeCurrentUserKycSession(session)))
  }
  
  return {
    connectWallet,
    disconnectWallet,
    disconnectGithub,
    connectGithub,
    updateWalletBalance,
    updateWalletAddress,
    validateGhAndWallet,
    listenToAccountsChanged,
    updateCurrentUserLogin,
    verifyReAuthorizationNeed,
    updateKycSession
  }
}