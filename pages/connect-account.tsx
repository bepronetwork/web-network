import {GetServerSideProps} from "next";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";

import InfoIconEmpty from "assets/icons/info-icon-empty";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import {FlexRow} from "components/common/flex-box/view";
import {ConnectionButton} from "components/profile/connect-button";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {CustomSession} from "interfaces/custom-session";

import { WinStorage } from "services/win-storage";

import useApi from "x-hooks/use-api";
import {useAuthentication} from "x-hooks/use-authentication";

export default function ConnectAccount() {
  const router = useRouter();
  const {data: sessionData} = useSession();
  const {t} = useTranslation(["common", "connect-account", "profile"]);

  const { joinAddressToUser } = useApi();
  const { state, dispatch } = useAppState();
  const {connectWallet, connectGithub, disconnectGithub, validateGhAndWallet} = useAuthentication();

  const { user: sessionUser } = (sessionData || {}) as CustomSession;

  const isButtonDisabled = [
    state.currentUser?.match !== undefined,
    !sessionUser?.login,
    !state.currentUser?.walletAddress
  ].some(condition => condition);

  const connectButtonState = {
    "undefined": undefined,
    "true": "success",
    "false": "danger"
  };

  const Message = ({ text, type } : { text: string, type: "success"| "danger" }) => 
  <FlexRow className={`p family-Regular align-items-center font-weight-medium svg-${type} text-${type} mt-3`}>
    <InfoIconEmpty width={12} height={12} />
    <span className="ml-1">
      {text}
    </span>
  </FlexRow>;

  function redirectToProfile() {
    const lastNetworkVisited = new WinStorage(`lastNetworkVisited`, 0, 'localStorage');

    const toNetworks = state.Service?.active?.network ? "/networks" : "/setup"

    const redirectTo = 
    lastNetworkVisited.value ? `${lastNetworkVisited.value}/profile` : toNetworks;

    router.push(redirectTo);
  }

  function handleCancel() {
    if (!state.currentUser?.match)
      disconnectGithub();

    const previusRouter = sessionStorage.getItem("lastUrlBeforeGithubConnect")

    if(previusRouter)
      return router.push(previusRouter)

    router.back();
  }

  async function joinAddressToGh() {
    dispatch(changeLoadState(true));

    joinAddressToUser({
      githubLogin: sessionUser?.login?.toString(),
      wallet: state.currentUser?.walletAddress.toLowerCase()
    }).then(() => {
      dispatch(toastSuccess(t("connect-account:connected-accounts")));

      return validateGhAndWallet();
    })
    .then(() => redirectToProfile())
    .catch(error => {
      console.debug("Failed to patch user", error);

      const reason = error?.response?.status === 409 ? t("connect-account.errors.no-actions-needed") : 
        t("connect-account.errors.try-again");

      dispatch(toastError(reason, t("connect-account:errors.something-went-wrong")));
    })
    .finally(() => dispatch(changeLoadState(false)));
  }

  return (
    <>
      <div className="banner-shadow">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 d-flex justify-content-center">
              <h1 className="h2 text-white text-center">
                {t("connect-account:connect-github-and-wallet")}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container connect-account">
        <div className="row justify-content-center">
          <div className="col-md-8 d-flex justify-content-center">
            <div className="content-wrapper mt-n4 mb-5">
              <strong className="caption-large d-block text-uppercase mb-4">
                {t("connect-account:connect-to-use")}
              </strong>
              <div className="row gx-3">
                <div className="col-6">
                  <ConnectionButton
                    type="github"
                    variant="connect-account"
                    state={connectButtonState[String(state.currentUser?.match)]}
                    credential={sessionUser?.login} 
                    connect={connectGithub}
                    isLoading={state.spinners?.connectingGH}
                    isDisabled={!state.currentUser?.walletAddress || state.spinners?.connectingGH}
                  />
                </div>
                <div className="col-6">
                  <ConnectionButton
                    type="wallet"
                    variant="connect-account"
                    state={connectButtonState[String(state.currentUser?.match)]}
                    credential={state.currentUser?.walletAddress}
                    connect={connectWallet}
                  />
                </div>
              </div>

              { state.currentUser?.match &&
                <Message 
                  text={t("connect-account:warnings.already-connected")}
                  type="success"
                />
              }

              { state.currentUser?.match === false &&
                <Message 
                  text={t("connect-account:warnings.already-in-use")}
                  type="danger"
                />
              }

              <div className="caption-small text-light-gray text-center fs-smallest text-dark text-uppercase mt-4">
                {t("misc.by-connecting")}{" "}
                <a
                  href="https://www.bepro.network/terms"
                  target="_blank"
                  className="text-decoration-none"
                  rel="noreferrer"
                >
                  {t("misc.terms-and-conditions")}
                </a>{" "}
                &{" "}
                <a
                  href="https://taikai.network/privacy"
                  target="_blank"
                  className="text-decoration-none"
                  rel="noreferrer"
                >
                  {t("misc.privacy-policy")}
                </a>
              </div>
              <div className="d-flex justify-content-center mt-4">
                <Button
                  className="me-3"
                  disabled={isButtonDisabled}
                  onClick={joinAddressToGh}
                >
                  {isButtonDisabled && (
                    <LockedIcon className="mr-1" width={14} height={14} />
                  )}
                  {t("actions.connect")}
                </Button>
                <Button color="dark-gray" onClick={handleCancel}>
                  {t("actions.back")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "profile", "connect-wallet-button", "connect-account"]))
    }
  };
};
