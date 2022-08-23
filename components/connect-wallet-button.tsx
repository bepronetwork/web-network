import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import Image from "next/image";

import metamaskLogo from "assets/metamask.png";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { changeNetworkId } from "contexts/reducers/change-network-id";
import { changeShowWeb3DialogState } from "contexts/reducers/change-show-web3-dialog";
import { useSettings } from "contexts/settings";

import { NetworkColors } from "interfaces/enums/network-colors";

export default function ConnectWalletButton({
  children = null,
  asModal = false,
  forceLogin = false,
}) {
  const { t } = useTranslation(["common", "connect-wallet-button"]);

  const {
    dispatch,
    state: { loading },
  } = useContext(ApplicationContext);
  const [showModal, setShowModal] = useState(false);

  const { service: DAOService } = useDAO();
  const { settings } = useSettings();
  const { wallet, connectWallet } = useAuthentication();

  useEffect(() => {
    if (!DAOService) return;

    if (forceLogin) connectWallet();
  }, [DAOService]);

  useEffect(() => {
    handleShowModal();
  }, [wallet]);

  async function handleLogin()  {
    if(!window?.ethereum) return dispatch(changeShowWeb3DialogState(true))
    if (DAOService) {
      DAOService.getChainId()
        .then((chainId) => {
          if (+chainId === +settings?.requiredChain?.id) {
            connectWallet();
          } else {
            dispatch(changeNetworkId(+chainId));
            setShowModal(false);
          }
        });
    } else {
      connectWallet();
    }
  }

  function handleShowModal() {
    if (!wallet?.address) setShowModal(true);
    else setShowModal(false);
  }

  if (asModal) {
    if (loading.isLoading) return <></>;

    return (
      <Modal
        title={t("connect-wallet-button:title")}
        titlePosition="center"
        centerTitle
        titleClass="h3 text-white bg-opacity-100"
        show={showModal}
      >
        <div className="d-flex flex-column text-center align-items-center">
          <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
            {t("connect-wallet-button:to-access-this-page")}
            <br />
            <span
              style={{ color: NetworkColors[settings?.requiredChain?.name?.toLowerCase()] }}
            >
              <span>{settings?.requiredChain?.name}</span>{" "}
              {t("connect-wallet-button:network")}
            </span>{" "}
            {t("connect-wallet-button:on-your-wallet")}
          </strong>
          <div className="d-flex justify-content-center align-items-center w-100">
            <div
              className="rounded-8 bg-dark-gray text-white p-3 d-flex text-center
                        justify-content-center align-items-center w-75 cursor-pointer"
              onClick={handleLogin}
            >
              <Image src={metamaskLogo} width={15} height={15} />
              <span className="text-white text-uppercase ms-2 caption-large">
                {t("misc.metamask")}
              </span>
            </div>
          </div>

          <div className="small-info text-center text-uppercase mt-1 pt-1">
            <span className="text-ligth-gray">{t("misc.by-connecting")} </span>
            <a
              href="https://www.bepro.network/terms-and-conditions"
              target="_blank"
              className="text-decoration-none text-primary"
              rel="noreferrer"
            >
              {t("misc.terms-and-conditions")}
            </a>{" "}
            <br />
            <span className="text-ligth-gray">{t("misc.and")} </span>
            <a
              href="https://www.bepro.network/privacy"
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

  if (!wallet)
    return (
      <Button
        color="white"
        className="text-dark bg-opacity-100"
        onClick={handleLogin}
      >
        <span>{t("main-nav.connect")}</span>
      </Button>
    );

  return children;
}
