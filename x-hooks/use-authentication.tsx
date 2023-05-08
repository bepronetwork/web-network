import {useState} from "react";

import BigNumber from "bignumber.js";
import {signIn, signOut, useSession} from "next-auth/react";
import getConfig from "next/config";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {changeChain} from "contexts/reducers/change-chain";
import {
  changeCurrentUser,
  changeCurrentUserAccessToken,
  changeCurrentUserBalance,
  changeCurrentUserHandle,
  changeCurrentUserKycSession,
  changeCurrentUserLogin,
  changeCurrentUserMatch,
  changeCurrentUserSignature,
  changeCurrentUserWallet,
  changeCurrentUserisAdmin
} from "contexts/reducers/change-current-user";
import {changeActiveNetwork} from "contexts/reducers/change-service";
import {changeConnectingGH, changeSpinners, changeWalletSpinnerTo} from "contexts/reducers/change-spinners";
import { addToast } from "contexts/reducers/change-toaster";
import {changeReAuthorizeGithub} from "contexts/reducers/update-show-prop";

import {IM_AN_ADMIN, NOT_AN_ADMIN, UNSUPPORTED_CHAIN} from "helpers/constants";
import decodeMessage from "helpers/decode-message";

import {EventName} from "interfaces/analytics";
import {CustomSession} from "interfaces/custom-session";
import {kycSession} from "interfaces/kyc-session";

import {WinStorage} from "services/win-storage";

import useAnalyticEvents from "x-hooks/use-analytic-events";
import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import {useDao} from "x-hooks/use-dao";
import {useNetwork} from "x-hooks/use-network";
import useSignature from "x-hooks/use-signature";
import {useTransactions} from "x-hooks/use-transactions";

export const SESSION_EXPIRATION_KEY =  "next-auth.expiration";

const { publicRuntimeConfig } = getConfig();

export function useAuthentication() {
  const session = useSession();
  const {asPath, push} = useRouter();

  const {connect} = useDao();
  const { chain } = useChain();
  const transactions = useTransactions();
  const { signMessage: _signMessage } = useSignature();
  const {state, dispatch} = useAppState();
  const { loadNetworkAmounts } = useNetwork();
  const { pushAnalytic } = useAnalyticEvents();

  const {getUserOf, getUserAll, searchCurators, getKycSession, validateKycSession} = useApi();

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

    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);

    expirationStorage.removeItem();

    const lastNetwork = state.Service?.network?.active ? `/${state.Service?.network?.active?.name?.toLowerCase()}` : "";
    const lastChain = 
      state.Service?.network?.active ? `/${state.Service?.network?.active?.chain?.chainShortName?.toLowerCase()}` : "";

    signOut({callbackUrl: `${URL_BASE}${lastNetwork}${lastChain}`})
      .then(() => {
        dispatch(changeCurrentUser.update({handle: state.currentUser?.handle, walletAddress: ''}));
      });
  }

  function connectWallet() {
    connect();
  }

  function updateWalletAddress() {
    if (state.spinners?.wallet || !state.currentUser?.connected)
      return;

    dispatch(changeWalletSpinnerTo(true));

    (state.Service?.active ?
      state.Service.active.getAddress() : window.ethereum.request({method: 'eth_requestAccounts'}))
      .then(_address => {
        if (Array.isArray(_address)) console.debug("eth_requestAccounts", _address);

        const address = Array.isArray(_address) ? _address[0] : _address;

        if (address !== state.currentUser?.walletAddress) {
          dispatch(changeCurrentUserWallet(address?.toLowerCase()));
          pushAnalytic(EventName.WALLET_ADDRESS_CHANGED, {newAddress: address?.toString()});
        }

        dispatch(changeCurrentUserisAdmin(publicRuntimeConfig.adminWallet.toLowerCase() === address?.toLowerCase()));

        const windowChainId = +window.ethereum.chainId;
        const chain = state.supportedChains?.find(({chainId}) => chainId === windowChainId);

        dispatch(changeChain.update({
          id: (chain?.chainId || windowChainId)?.toString(),
          name: chain?.chainName || UNSUPPORTED_CHAIN,
          shortName: chain?.chainShortName?.toLowerCase() || UNSUPPORTED_CHAIN,
          explorer: chain?.blockScanner,
          events: chain?.eventsApi,
          registry: chain?.registryAddress
        }));

        sessionStorage.setItem("currentChainId", chain ? chain?.chainId?.toString() : (+windowChainId)?.toString());
        sessionStorage.setItem("currentWallet", address || '');
      })
      .catch(e => {
        console.error("Error getting address", e);
      })
      .finally(() => {
        dispatch(changeWalletSpinnerTo(false));
      })

  }

  function connectGithub() {
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

    getUserAll(walletAddress,userLogin)
      .then(async(user) => {
        if (!user?.githubLogin){
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
    if ((!force && (balance.value || !state.currentUser?.walletAddress)) || !state.Service?.active?.network || !chain)
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
      searchCurators({
        address: state.currentUser.walletAddress,
        networkName: state.Service?.network?.active?.name,
        chainShortName: chain.chainShortName
      })
      .then(v => v?.rows[0]?.tokensLocked || 0).then(value => new BigNumber(value)),
      // not balance, but related to address, no need for a second useEffect()
      state.Service.active.isCouncil(state.currentUser.walletAddress),
      state.Service.active.isNetworkGovernor(state.currentUser.walletAddress)
    ])
      .then(([oracles, bepro, staked, isCouncil, isGovernor]) => {
        update({oracles, bepro, staked});
        updateNetwork({isCouncil, isGovernor});
      })
      .catch(error => console.debug("Failed to updateWalletBalance", error))
      .finally(() => {
        dispatch(changeSpinners.update({balance: false}));
        console.debug(`should have updated state`, state.currentUser.balance)
      });

    loadNetworkAmounts();
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

    pushAnalytic(EventName.USER_LOGGED_IN, {username: session.data.user.name, login: sessionUser.login});

  }

  function verifyReAuthorizationNeed() {
    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);

    dispatch(changeReAuthorizeGithub(!!expirationStorage.value && new Date(expirationStorage.value) < new Date()));
  }

  function signMessage(message?: string) {
    return new Promise<string>(async (resolve, reject) => {
      if (!state?.currentUser?.walletAddress ||
          !state?.connectedChain?.id ||
          state.Service?.starting ||
          state.spinners?.signingMessage) {
        reject("Wallet not connected, service not started or already signing a message");
        return;
      }

      const currentWallet = state?.currentUser?.walletAddress?.toLowerCase();
      const isAdminUser = currentWallet === publicRuntimeConfig?.adminWallet?.toLowerCase();

      if (!isAdminUser && state.connectedChain?.name === UNSUPPORTED_CHAIN) {
        dispatch(addToast({
          type: "warning",
          title: "Unsupported chain",
          content: "To sign a message, connect to a supported chain",
        }));

        reject("Unsupported chain");
        return;
      }

      const messageToSign = message || (isAdminUser ? IM_AN_ADMIN : NOT_AN_ADMIN);

      const storedSignature = sessionStorage.getItem("currentSignature");

      if (decodeMessage(state?.connectedChain?.id,
                        messageToSign,
                        storedSignature || state?.currentUser?.signature,
                        currentWallet)) {
        if (storedSignature)
          dispatch(changeCurrentUserSignature(storedSignature));
        else
          sessionStorage.setItem("currentSignature", state?.currentUser?.signature);

        resolve(storedSignature || state?.currentUser?.signature);
        return;
      }

      dispatch(changeSpinners.update({ signingMessage: true }));

      await _signMessage(messageToSign)
        .then(signature => {
          dispatch(changeSpinners.update({ signingMessage: false }));

          if (signature) {
            dispatch(changeCurrentUserSignature(signature));
            sessionStorage.setItem("currentSignature", signature);

            resolve(signature);
            return;
          }

          dispatch(changeCurrentUserSignature(undefined));
          sessionStorage.removeItem("currentSignature");

          reject("Message not signed");
          return;
        });
    });
  }

  function updateKycSession(){
    if(!state?.currentUser?.login
        || !state?.currentUser?.match
        || !state?.currentUser?.accessToken
        || !state?.currentUser?.walletAddress
        || !state?.Settings?.kyc?.isKycEnabled)
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
    signMessage,
    updateKycSession,
  }
}