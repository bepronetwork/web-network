import {useState} from "react";

import BigNumber from "bignumber.js";
import {getCsrfToken, signIn as nextSignIn, signOut as nextSignOut, useSession} from "next-auth/react";
import getConfig from "next/config";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {
  changeCurrentUserAccessToken,
  changeCurrentUserBalance,
  changeCurrentUserConnected,
  changeCurrentUserHandle,
  changeCurrentUserKycSession,
  changeCurrentUserLogin,
  changeCurrentUserMatch,
  changeCurrentUserSignature,
  changeCurrentUserWallet,
  changeCurrentUserisAdmin
} from "contexts/reducers/change-current-user";
import {changeActiveNetwork} from "contexts/reducers/change-service";
import {changeSpinners} from "contexts/reducers/change-spinners";
import { addToast } from "contexts/reducers/change-toaster";
import {changeReAuthorizeGithub} from "contexts/reducers/update-show-prop";

import {IM_AN_ADMIN, NOT_AN_ADMIN, UNSUPPORTED_CHAIN} from "helpers/constants";
import decodeMessage from "helpers/decode-message";
import { AddressValidator } from "helpers/validators/address";

import {EventName} from "interfaces/analytics";
import {CustomSession} from "interfaces/custom-session";
import { UserRole } from "interfaces/enums/roles";
import {kycSession} from "interfaces/kyc-session";

import {WinStorage} from "services/win-storage";

import { SESSION_TTL } from "server/auth/config";

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
  const { asPath } = useRouter();

  const { connect } = useDao();
  const { chain } = useChain();
  const transactions = useTransactions();
  const { signMessage: _signMessage, signInWithEthereum } = useSignature();
  const { state, dispatch } = useAppState();
  const { loadNetworkAmounts } = useNetwork();
  const { pushAnalytic } = useAnalyticEvents();

  const { searchCurators, getKycSession, validateKycSession } = useApi();

  const [balance] = useState(new WinStorage('currentWalletBalance', 1000, 'sessionStorage'));

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${ window.location.host}` : "";

  function signOut(redirect?: string) {
    const expirationStorage = new WinStorage(SESSION_EXPIRATION_KEY, 0);

    expirationStorage.removeItem();
    transactions.deleteFromStorage();

    nextSignOut({
      callbackUrl: `${URL_BASE}/${redirect || ""}`
    });
  }

  async function signInWallet() {
    const address = await connect();

    if (!address) return;

    const csrfToken = await getCsrfToken();

    const issuedAt = new Date();
    const expiresAt = new Date(+issuedAt + SESSION_TTL);

    const signature = await signInWithEthereum(csrfToken, address, issuedAt, expiresAt);

    if (!signature) return;

    nextSignIn("credentials", {
      redirect: false,
      signature,
      issuedAt: +issuedAt,
      expiresAt: +expiresAt,
      callbackUrl: `${URL_BASE}${asPath}`
    });
  }

  function signInGithub() {
    nextSignIn("github", {
      callbackUrl: `${URL_BASE}${asPath}`
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

  async function syncUserDataWithSession() {
    if (session?.status === "loading") return;

    const isUnauthenticated = session?.status === "unauthenticated";

    if (isUnauthenticated) {
      dispatch(changeCurrentUserConnected(false));
      dispatch(changeCurrentUserHandle(null));
      dispatch(changeCurrentUserLogin(null));
      dispatch(changeCurrentUserAccessToken(null));
      dispatch(changeCurrentUserWallet(null));
      dispatch(changeCurrentUserisAdmin(null));
      dispatch(changeCurrentUserMatch(null));

      sessionStorage.setItem("currentWallet", "");

      return;
    }

    const user = session?.data?.user as CustomSession["user"];
    const isSameGithubAccount = 
      user.login === state.currentUser?.login && user.accessToken === state.currentUser?.accessToken;
    const isSameWallet = AddressValidator.compare(user.address, state.currentUser?.walletAddress);

    if (user.accountsMatch !== state.currentUser?.match)
      dispatch(changeCurrentUserMatch(user.accountsMatch));

    if (!user || isSameGithubAccount && isSameWallet)
      return;

    if (!isSameGithubAccount) {
      dispatch(changeCurrentUserHandle(user.name));
      dispatch(changeCurrentUserLogin(user.login));
      dispatch(changeCurrentUserAccessToken(user.accessToken));
    }

    if (!isSameWallet) {
      const isAdmin = user.roles.includes(UserRole.ADMIN);

      dispatch(changeCurrentUserWallet(user.address));
      dispatch(changeCurrentUserisAdmin(isAdmin));

      sessionStorage.setItem("currentWallet", user.address);
    }

    await connect();

    dispatch(changeCurrentUserConnected(true));

    pushAnalytic(EventName.USER_LOGGED_IN, { username: user.name, login: user.login });
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
    signOut,
    signInWallet,
    signInGithub,
    updateWalletBalance,
    verifyReAuthorizationNeed,
    signMessage,
    updateKycSession,
    syncUserDataWithSession,
  }
}