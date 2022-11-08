import {createContext, useContext, useEffect, useState} from "react";

import {signIn, signOut, useSession} from "next-auth/react";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {
  changeCurrentUser,
  changeCurrentUserAccessToken,
  changeCurrentUserBalance,
  changeCurrentUserHandle,
  changeCurrentUserLogin,
  changeCurrentUserMatch,
  changeCurrentUserWallet
} from "contexts/reducers/change-current-user";

import {Balance} from "interfaces/balance-state";
import {Network} from "interfaces/network";

import {WinStorage} from "services/win-storage";

import {changeActiveNetwork} from "../contexts/reducers/change-service";
import {changeSpinners, changeWalletSpinnerTo} from "../contexts/reducers/change-spinners";
import useApi from "./use-api";
import {useDao} from "./use-dao";

export const AuthContext = createContext({});
export const AuthProvider = ({children}) => <AuthContext.Provider value={{}} children={children} />

export function useAuthentication() {

  if (!useContext(AuthContext))
    throw new Error(`useAuthentication() must use AuthProvider`);

  const session = useSession();
  const {state, dispatch} = useAppState();
  const {connect} = useDao();

  const {asPath, push} = useRouter();
  const {getUserOf, getUserWith} = useApi();

  const [lastUrl,] = useState(new WinStorage('lastUrlBeforeGHConnect', 0, 'sessionStorage'));
  const [balance,] = useState(new WinStorage('lastUrlBeforeGHConnect', 1000, 'sessionStorage'));

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${ window.location.host}` : "";

  function disconnectGithub() {
    return signOut({redirect: false});
  }

  function disconnectWallet() {

    if (!state.currentUser?.walletAddress)
      return;

    signOut({callbackUrl: `${URL_BASE}/${state.Service.network.lastVisited}`})
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

    console.log(`updating wallet`)

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
          return;

        lastUrl.value = asPath;

        return signedIn ? signIn('github', {callbackUrl: `${URL_BASE}${asPath}`}) : null;
      })
  }

  function validateGhAndWallet() {
    if (!state.currentUser?.walletAddress || !(session?.data?.user as any)?.login || state.spinners?.matching)
      return;

    dispatch(changeSpinners.update({matching: true}));

    const userLogin = (session.data.user as any).login;
    const walletAddress = state.currentUser.walletAddress.toLowerCase();

    getUserWith(userLogin)
      .then(user => {
        if (!user.githubLogin && state.currentUser?.match !== undefined)
          dispatch(changeCurrentUserMatch(undefined));
        else if (user.githubLogin && userLogin)
          dispatch(changeCurrentUserMatch(userLogin === user.githubLogin &&
            (walletAddress ? walletAddress === user.address : true)));

      })
      .finally(() => {
        dispatch(changeSpinners.update({matching: false}));
      })
  }

  function listenToAccountsChanged() {
    if (!state.Service || window?.ethereum?.listenerCount(`accountsChanged`) > 0)
      return;

    window.ethereum.on(`accountsChanged`, () => {
      connect();
    });
  }

  function updateWalletBalance(force = false) {
    if (!force && (balance.value || !state.currentUser?.walletAddress))
      return;

    const update = (k: keyof Balance) => (b) => {
      const newState = Object.assign(state.currentUser.balance || {}, {[k]: b});
      dispatch(changeCurrentUserBalance(newState));
      balance.value = newState;
    }

    const updateNetwork = (k: keyof Network) => (v) =>
      dispatch(changeActiveNetwork(Object.assign(state.Service.network.active || {} as any, {[k]: v})));

    dispatch(changeSpinners.update({balance: true}))

    Promise.all([
      state.Service.active.getOraclesResume(state.currentUser.walletAddress).then(update('oracles')),

      state.Service.active.getBalance('settler', state.currentUser.walletAddress).then(update('bepro')),
      state.Service.active.getBalance('eth', state.currentUser.walletAddress).then(update('eth')),
      state.Service.active.getBalance('staked', state.currentUser.walletAddress).then(update('staked')),

      // not balance, but related to address, no need for a second useEffect()
      state.Service.active.isCouncil(state.currentUser.walletAddress).then(updateNetwork('isCouncil')),
      state.Service.active.isNetworkGovernor(state.currentUser.walletAddress).then(updateNetwork('isGovernor'))
    ])
      .finally(() => {
        dispatch(changeSpinners.update({balance: false}));
        console.log(`should have updated state`, state.currentUser.balance)
      })
  }

  function updateCurrentUserLogin() {
    if (!session?.data?.user || state.currentUser?.login === (session.data?.user as any)?.login ||
      (session.data?.user as any).accessToken === state.currentUser?.accessToken)
      return;

    dispatch(changeCurrentUserHandle(session.data.user.name));
    dispatch(changeCurrentUserLogin((session.data.user as any).login));
    dispatch(changeCurrentUserAccessToken((session.data.user as any).accessToken));
  }

  // if (useContext(AuthContext)) {
  useEffect(validateGhAndWallet, [(session?.data?.user as any)?.login, state.currentUser?.walletAddress]);
  useEffect(updateWalletAddress, [state.currentUser]);
  useEffect(listenToAccountsChanged, [state.Service]);
  useEffect(updateWalletBalance, [state.currentUser?.walletAddress]);
  useEffect(updateCurrentUserLogin, [session?.data?.user]);
  // }

  return {
    connectWallet,
    disconnectWallet,
    disconnectGithub,
    connectGithub,
    updateWalletBalance,
    validateGhAndWallet
  }
}