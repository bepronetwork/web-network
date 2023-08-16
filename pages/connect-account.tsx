import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import InfoIconEmpty from "assets/icons/info-icon-empty";

import Button from "components/button";
import { FlexRow } from "components/common/flex-box/view";
import TermsAndConditions from "components/common/terms-and-conditions/view";
import If from "components/If";
import {ConnectionButton } from "components/profile/connect-button";

import { useAppState } from "contexts/app-state";
import { changeLoadState } from "contexts/reducers/change-load";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import { MatchAccountsStatus } from "interfaces/enums/api";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";

export default function ConnectAccount() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { t } = useTranslation(["common", "connect-account", "profile"]);

  const { joinAddressToUser } = useApi();
  const { state, dispatch } = useAppState();
  const { signInWallet, signInGithub, signOut } = useAuthentication();

  const isMatch = state.currentUser?.match === MatchAccountsStatus.MATCH;
  const isMismatch = state.currentUser?.match === MatchAccountsStatus.MISMATCH;

  const isButtonDisabled = [
    !!state.currentUser?.match,
    !state.currentUser?.login,
    !state.currentUser?.walletAddress
  ].some(condition => condition);

  const connectButtonState = isMatch ? "success" : isMismatch ? "danger" : undefined;

  const Message = ({ text, type } : { text: string, type: "success"| "danger" }) => 
    <FlexRow className={`p family-Regular align-items-center font-weight-medium svg-${type} text-${type} mt-3`}>
      <InfoIconEmpty width={12} height={12} />
      <span className="ml-1">
        {text}
      </span>
    </FlexRow>;

  function handleCancel() {
    if (isMismatch)
      signOut();

    const previousRouter = sessionStorage.getItem("lastUrlBeforeGithubConnect")

    if(previousRouter)
      return router.push(previousRouter);

    router.back();
  }

  async function joinAddressToGh() {
    dispatch(changeLoadState(true));

    joinAddressToUser({
      githubLogin: state.currentUser?.login?.toString(),
      wallet: state.currentUser?.walletAddress.toLowerCase(),
    }).then(() => {
      dispatch(toastSuccess(t("connect-account:connected-accounts")));

      return updateSession();
    })
    .then(() => router.push("/profile"))
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
                    state={connectButtonState}
                    credential={state.currentUser?.login} 
                    connect={signInGithub}
                    isLoading={state.spinners?.connectingGH}
                    isDisabled={state.spinners?.connectingGH}
                  />
                </div>

                <div className="col-6">
                  <ConnectionButton
                    type="wallet"
                    variant="connect-account"
                    state={connectButtonState}
                    credential={state.currentUser?.walletAddress}
                    connect={signInWallet}
                  />
                </div>
              </div>

              <If condition={isMatch}>
                <Message 
                  text={t("connect-account:warnings.already-connected")}
                  type="success"
                />
              </If>

              <If condition={isMismatch}>
                <Message 
                  text={t("connect-account:warnings.already-in-use")}
                  type="danger"
                />
              </If>

              <TermsAndConditions />

              <div className="d-flex justify-content-center mt-4 gap-3">
                <Button
                  disabled={isButtonDisabled}
                  onClick={joinAddressToGh}
                  withLockIcon={isButtonDisabled}
                >
                  <span>{t("actions.connect")}</span>
                </Button>

                <Button color="dark-gray" onClick={handleCancel}>
                  <span>{t("actions.back")}</span>
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
