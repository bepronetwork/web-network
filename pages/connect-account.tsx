import { useContext } from "react";

import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import InfoIconEmpty from "assets/icons/info-icon-empty";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import { ConnectionButton } from "components/profile/connect-button";
import { FlexRow } from "components/profile/wallet-balance";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";
import { toastError, toastSuccess } from "contexts/reducers/add-toast";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { CustomSession } from "interfaces/custom-session";

import useApi from "x-hooks/use-api";

export default function ConnectAccount() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { t } = useTranslation(["common", "connect-account", "profile"]);

  const { joinAddressToUser } = useApi();
  const { lastNetworkVisited } = useNetwork();
  const { dispatch } = useContext(ApplicationContext);
  const { 
    wallet, 
    isGithubAndWalletMatched, 
    connectWallet, 
    connectGithub, 
    validateWalletAndGithub 
  } = useAuthentication();

  const { user: sessionUser } = (sessionData || {}) as CustomSession;

  const isButtonDisabled = isGithubAndWalletMatched !== undefined;
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
    const redirectTo = lastNetworkVisited ? `${lastNetworkVisited}/profile` : "/networks";

    router.push(redirectTo);
  }

  async function joinAddressToGh() {
    dispatch(changeLoadState(true));

    joinAddressToUser({
      githubLogin: sessionUser?.login?.toString(),
      wallet: wallet?.address.toLowerCase()
    }).then(() => {
      dispatch(toastSuccess(t("connect-account:connected-accounts")));

      return validateWalletAndGithub(wallet?.address.toLowerCase(), sessionUser?.login?.toString());
    })
    .then(() => redirectToProfile())
    .catch(error => {
      console.debug("Failed to patch user", error);

      const reason = error?.response?.status === 409 ? "No actions needed for this user" : "Try again later";

      dispatch(toastError(reason, "Something went wrong"));
    })
    .finally(() => dispatch(changeLoadState(false)));
  }

  return (
    <>
      <div className="banner-shadow mb-5">
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
                    state={connectButtonState[String(isGithubAndWalletMatched)]}
                    credential={sessionUser?.login} 
                    connect={connectGithub}
                  />

                  
                </div>
                <div className="col-6">
                  <ConnectionButton
                    type="wallet"
                    variant="connect-account"
                    state={connectButtonState[String(isGithubAndWalletMatched)]}
                    credential={wallet?.address} 
                    connect={connectWallet}
                  />
                </div>
              </div>

              { isGithubAndWalletMatched &&
                <Message 
                  text="These accounts are already connected"
                  type="success"
                />
              }

              { isGithubAndWalletMatched === false &&
                <Message 
                  text="This github account or this wallet is already in use"
                  type="danger"
                />
              }

              <div className="caption-small text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-4">
                {t("misc.by-connecting")}{" "}
                <a
                  href="https://www.bepro.network/terms-and-conditions"
                  target="_blank"
                  className="text-decoration-none"
                  rel="noreferrer"
                >
                  {t("misc.terms-and-conditions")}
                </a>{" "}
                &{" "}
                <a
                  href="https://www.bepro.network/privacy"
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
                  {t("actions.done")}
                </Button>
                <Button color="dark-gray" onClick={redirectToProfile}>
                  {t("actions.cancel")}
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
