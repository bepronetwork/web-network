import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import Image from "next/image";

import metamaskLogo from "assets/metamask.png";

import Button from "components/button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {changeShowWeb3} from "contexts/reducers/update-show-prop";

import {useAuthentication} from "x-hooks/use-authentication";

export default function ConnectWalletButton({children = null, asModal = false, forceLogin = false,}) {
  const { t } = useTranslation(["common", "connect-wallet-button"]);

  const [showModal, setShowModal] = useState(false);

  const {dispatch, state} = useAppState();

  const { connectWallet } = useAuthentication();

  async function handleLogin()  {

    if(!window?.ethereum) {
      dispatch(changeShowWeb3(true))
      return;
    }

    connectWallet();
  }

  function onWalletChange() {
    setShowModal(!state.currentUser?.walletAddress);
  }

  useEffect(() => {
    if (!state.Service?.active) return;

    if (forceLogin)
      connectWallet();

  }, [state.Service?.active, forceLogin]);

  useEffect(onWalletChange, [state.currentUser?.walletAddress]);

  if (asModal) {
    if (state?.loading?.isLoading) return <></>;

    return (
      <Modal
        title={t("connect-wallet-button:title")}
        titlePosition="center"
        centerTitle
        titleClass="h3 text-white bg-opacity-100"
        show={showModal}>
        <div className="d-flex flex-column text-center align-items-center">
          <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
            {t("connect-wallet-button:this-page-needs-access-to-your-wallet-address")}
          </strong>
          <div className="d-flex justify-content-center align-items-center w-100">
            <div
              className="rounded-8 bg-dark-gray text-white p-3 d-flex text-center
                        justify-content-center align-items-center w-75 cursor-pointer"
              onClick={() => handleLogin()}
            >
              <Image src={metamaskLogo} width={15} height={15} />
              <span className="text-white text-uppercase ms-2 caption-large">
                {t("misc.metamask")}
              </span>
            </div>
          </div>

          <div className="small-info text-center text-uppercase mt-1 pt-1">
            <span className="text-light-gray">{t("misc.by-connecting")} </span>
            <a
              href="https://www.bepro.network/terms"
              target="_blank"
              className="text-decoration-none text-primary"
              rel="noreferrer"
            >
              {t("misc.terms-and-conditions")}
            </a>{" "}
            <br />
            <span className="text-light-gray">{t("misc.and")} </span>
            <a
              href="https://taikai.network/privacy"
              target="_blank"
              className="text-decoration-none text-primary"
              rel="noreferrer"
            >
              {t("misc.privacy-policy")}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  if (!state.currentUser?.walletAddress)
    return (
      <Button
        color="white"
        className="text-dark bg-opacity-100"
        onClick={handleLogin}>
        <span>{t("main-nav.connect")}</span>
      </Button>
    );

  return <>{children}</>;
}
