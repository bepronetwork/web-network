import { useContext, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import Image from "next/image";
import { useRouter } from "next/router";

import CheckMarkIcon from "assets/icons/checkmark-icon";
import ErrorMarkIcon from "assets/icons/errormark-icon";
import LockedIcon from "assets/icons/locked-icon";
import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import Button from "components/button";
import GithubImage from "components/github-image";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { toastError, toastSuccess } from "contexts/reducers/add-toast";
import { changeCurrentAddress } from "contexts/reducers/change-current-address";
import { changeGithubHandle } from "contexts/reducers/change-github-handle";
import { changeGithubLogin } from "contexts/reducers/change-github-login";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { changeNetwork } from "contexts/reducers/change-network";
import { changeNetworkId } from "contexts/reducers/change-network-id";
import { changeWalletState } from "contexts/reducers/change-wallet-connect";

import { truncateAddress } from "helpers/truncate-address";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig()

export default function ConnectAccount() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation(["common", "connect-account"]);

  const [isGhValid, setIsGhValid] = useState(null);
  const [lastAddressBeforeConnect, setLastAddressBeforeConnect] = useState("");

  const { getUserOf, joinAddressToUser, getUserWith } = useApi();

  const { wallet, user } = useAuthentication();
  const { network, getURLWithNetwork } = useNetwork();
  const { dispatch } = useContext(ApplicationContext);

  const { migrate } = router.query;

  function updateLastUsedAddress() {
    dispatch(changeLoadState(false));
    setLastAddressBeforeConnect(localStorage.getItem("lastAddressBeforeConnect"));
  }

  async function checkAddressVsGh() {
    if (!wallet?.address || !user?.login) return;

    const validatingUser = await getUserWith(user?.login);

    if (
      validatingUser &&
      validatingUser.address &&
      validatingUser.address !== wallet?.address.toLowerCase()
    ) {
      dispatch(toastError(t("connect-account:errors.migrating-address-not-match", {
            address: truncateAddress(validatingUser.address)
      }),
                          undefined,
          { delay: 10000 }));
      setIsGhValid(false);
      return;
    }

    getUserOf(wallet?.address).then((user) => {
      setIsGhValid((user &&
          user.githubHandle ===
            (session?.user.name || (session?.user as any)?.login)) ||
          true);

      if (!user) return;

      if (!isGhValid) return;

      if (user.address === wallet?.address)
        return router.push(getURLWithNetwork("/account"));
    });
  }

  function getValidClass() {
    return isGhValid === null
      ? ""
      : `border border-${!isGhValid ? "danger" : "success"}`;
  }

  async function joinAddressToGh() {
    dispatch(changeLoadState(true));

    const validatingUser = await getUserOf(wallet?.address);

    if (
      validatingUser &&
      (validatingUser.githubHandle ||
        validatingUser.accessToken.toLowerCase() !==
          user?.accessToken.toLowerCase())
    ) {
      dispatch(changeLoadState(false));
      return dispatch(toastError(t("connect-account:errors.migrating-already-happened")));
    }

    joinAddressToUser(session.user.name || user?.login, {
      address: wallet?.address.toLowerCase(),
      migrate: !!migrate
    }).then((result) => {
      if (result === true) {
        dispatch(toastSuccess(t("connect-account:connected-accounts")));
        dispatch(changeLoadState(false));
        dispatch(changeGithubHandle(session.user.name || user?.login));
        dispatch(changeGithubLogin(user?.login));
        return router.push(getURLWithNetwork("/account"));
      }

      dispatch(toastError(result as unknown as string));
      dispatch(changeLoadState(false));
    });
  }

  function cancelAndSignOut() {
    dispatch(changeGithubHandle(""));
    dispatch(changeGithubLogin(""));
    return signOut({ redirect: false }).then(() => router.push("/"));
  }

  async function connectWallet() {
    if (wallet?.address) return;

    let loggedIn = false;

    try {
      const chainId = (window as any)?.ethereum?.chainId;
      if (+publicRuntimeConfig.metaMask.chainId !== +chainId) {
        dispatch(changeNetworkId(+chainId));
        dispatch(changeNetwork((publicRuntimeConfig.networkIds[+chainId] || "unknown")?.toLowerCase()));
        return;
      } else {
        await BeproService.login();
        loggedIn = BeproService.isLoggedIn;
      }
    } catch (e) {
      console.error("Failed to login on BeproService", e);
    }

    if (!loggedIn) {
      dispatch(changeWalletState(false));
      dispatch(changeCurrentAddress(""));
    } else {
      dispatch(changeWalletState(loggedIn));
      dispatch(changeCurrentAddress(BeproService.address));
    }

    return loggedIn;
  }

  function connectGithub() {
    localStorage.setItem("lastAddressBeforeConnect", wallet?.address);
    return signIn("github", {
      callbackUrl: `${window.location.protocol}//${
        window.location.host
      }/${network.name.toLowerCase()}/connect-account`
    });
  }

  function renderMetamaskLogo() {
    return <Image src={metamaskLogo} width={15} height={15} />;
  }

  useEffect(updateLastUsedAddress, []);
  useEffect(() => {
    checkAddressVsGh();
  }, [wallet?.address]);

  return (
    <>
      <div className="banner">
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
                  <div
                    className={`button-connect border bg-${
                      user?.login
                        ? "dark border-dark"
                        : "black border-black border-primary-hover cursor-pointer"
                    } d-flex justify-content-between p-3 align-items-center`}
                    onClick={connectGithub}
                  >
                    {!user?.login && (
                      <div className="mx-auto d-flex align-items-center">
                        <GithubImage width={15} height={15} opacity={1} />{" "}
                        <span className="ms-2 text-uppercase caption-large">
                          {t("misc.github")}
                        </span>
                      </div>
                    )}
                    {user?.login && (
                      <>
                        <div>
                          <Avatar
                            src={session?.user?.image}
                            userLogin={user?.login || "null"}
                          />{" "}
                          <span className="ms-2">{session?.user?.name}</span>
                        </div>
                        <CheckMarkIcon />
                      </>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className={`button-connect border bg-${
                      wallet?.address
                        ? "dark border-dark"
                        : "black border-black border-primary-hover cursor-pointer"
                    } d-flex justify-content-between p-3 align-items-center ${getValidClass()}`}
                    onClick={connectWallet}
                  >
                    {!wallet?.address && (
                      <div className="mx-auto d-flex align-items-center">
                        {renderMetamaskLogo()}{" "}
                        <span className="ms-2 text-uppercase caption-large">
                          {t("misc.metamask")}
                        </span>
                      </div>
                    )}
                    {wallet?.address && (
                      <>
                        <div>
                          {renderMetamaskLogo()}{" "}
                          <span className="ms-2">
                            {(wallet?.address &&
                              truncateAddress(wallet?.address)) ||
                              t("actions.connect-wallet")}
                          </span>
                        </div>
                        {isGhValid ? <CheckMarkIcon /> : <ErrorMarkIcon />}
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                  disabled={!isGhValid}
                  onClick={joinAddressToGh}
                >
                  {!isGhValid && (
                    <LockedIcon className="mr-1" width={14} height={14} />
                  )}
                  {t("actions.done")}
                </Button>
                <Button color="dark-gray" onClick={cancelAndSignOut}>
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
      ...(await serverSideTranslations(locale, ["common", "connect-account"]))
    }
  };
};
