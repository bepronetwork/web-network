import {useContext, useEffect, useState} from "react";

import {signIn, signOut, useSession} from "next-auth/react";
import {useRouter} from "next/router";

import { useAppState } from "contexts/app-state";
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

export function useAuthentication() {
  const session = useSession();
  const {state, dispatch} = useAppState();
  const {connect} = useDao();

  const {asPath, push} = useRouter();
  const {getUserOf, getUserWith} = useApi();

  const [lastUrl,] = useState(new WinStorage('lastUrlBeforeGHConnect', 0, 'sessionStorage'));
  const [balance,] = useState(new WinStorage('lastUrlBeforeGHConnect', 1000, 'sessionStorage'));

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${ window.location.host}` : "";

  function disconnectGithub() {
    signOut({redirect: false});
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

    dispatch(changeWalletSpinnerTo(true));

    state.Service.active.getAddress()
      .then(address => {
        if (address !== state.currentUser?.walletAddress)
          dispatch(changeCurrentUserWallet(address))
      })
      .catch(e => {
        console.error(`Error getting address`, e);
      })
      .finally(() => {
        dispatch(changeWalletSpinnerTo(false));
      })

  }

  function connectGithub() {
    if (!state.Service?.active?.web3Connection?.Account?.address)
      return;

    getUserOf(state.Service.active.web3Connection.Account.address)
      .then((user) => {
        if (!user.githubLogin && !asPath.includes(`connect-account`)) {
          disconnectGithub();
          push(`/connect-account`);
          return false;
        }
        return true;
      })
      .then(_signIn => {
        if (!_signIn)
          return;

        lastUrl.value = asPath;

        return _signIn ? signIn('github', {callbackUrl: `${URL_BASE}${asPath}`}) : null;
      })
  }

  function validateGhAndWallet() {
    if (!state.currentUser?.walletAddress || !(session?.data?.user as any)?.login) {
      // dispatch(changeCurrentUserMatch(undefined));
      return;
    }

    const userLogin = (session.data.user as any).login;
    const walletAddress = state.currentUser.walletAddress

    getUserWith(userLogin)
      .then(user => {
        if (!user.githubLogin)
          dispatch(changeCurrentUserMatch(undefined));
        else if (user.githubLogin && userLogin)
          dispatch(changeCurrentUserMatch(userLogin === user.githubLogin &&
            (walletAddress ? walletAddress === user.address : true)));
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
      dispatch(changeActiveNetwork(Object.assign(state.Service.network.active, {[k]: v})));

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
    if (!session?.data?.user ||
      state.currentUser.login === (session.data.user as any).login ||
      (session.data?.user as any).accessToken !== state.currentUser?.accessToken)
      return;

    dispatch(changeCurrentUserHandle(session.data.user.name));
    dispatch(changeCurrentUserLogin((session.data.user as any).login));
    dispatch(changeCurrentUserAccessToken((session.data.user as any).accessToken));
  }

  useEffect(validateGhAndWallet, [(session?.data?.user as any)?.login, state.currentUser]);
  useEffect(updateWalletAddress, [state.currentUser]);
  useEffect(listenToAccountsChanged, [state.Service]);
  useEffect(updateWalletBalance, [state.currentUser?.walletAddress]);
  useEffect(updateCurrentUserLogin, [session?.data?.user])

  return {
    connectWallet,
    disconnectWallet,
    disconnectGithub,
    connectGithub,
    updateWalletBalance,
    validateGhAndWallet
  }
}