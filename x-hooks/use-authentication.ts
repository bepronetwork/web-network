import {useContext, useEffect, useState} from "react";
import {AppStateContext} from "../contexts/app-state";
import {signIn, signOut, useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {useDao} from "./use-dao";
import {changeCurrentUser} from "../contexts/reducers/change-current-user";
import {useNetwork} from "./use-network";
import useApi from "./use-api";
import {WinStorage} from "../services/win-storage";

export function useAuthentication() {
  const sessions = useSession();
  const {state, dispatch} = useContext(AppStateContext);
  const {connect} = useDao();
  const {clearNetworkFromStorage} = useNetwork();

  const {asPath, pathname, push} = useRouter();
  const {getUserOf, getUserWith} = useApi();

  const [lastUrl,] = useState(new WinStorage('lastUrlBeforeGHConnect', 0, 'sessionStorage'));

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${ window.location.host}` : "";

  function disconnectGithub() {
    signOut({redirect: false});
  }

  function disconnectWallet() {
    if (!state.currentUser?.walletAddress)
      return;

    dispatch(changeCurrentUser.update({handle: state.currentUser?.handle, walletAddress: ''}));
    signOut({
      callbackUrl: `${URL_BASE}/${state.Service.network.lastVisited}`
    });
  }

  function connectWallet() {
    if (!state.Service?.active)
      return;

    connect();
  }

  function updateWalletAddress() {
    if (!state.Service?.active?.web3Connection?.Account?.address)
      return;

    if (state.Service?.active?.web3Connection?.Account?.address === state.currentUser?.walletAddress)
      return;

    dispatch(changeCurrentUser.update({
      walletAddress: state.Service.active.web3Connection.Account.address,
      handle: state.currentUser?.handle || ''
    }));
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

  useEffect(updateWalletAddress, [state.Service?.active]);

  return {
    connectWallet,
    disconnectWallet,
    disconnectGithub,
    connectGithub
  }

}