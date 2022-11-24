import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import Image from "next/image";

import metamaskLogo from "assets/metamask.png";

import Button from "components/button";
import Modal from "components/modal";

import {NetworkColors} from "interfaces/enums/network-colors";

import {useAuthentication} from "x-hooks/use-authentication";

import {useAppState} from "../contexts/app-state";
import {changeChain} from "../contexts/reducers/change-chain";
import {changeShowWeb3} from "../contexts/reducers/update-show-prop";

export default function ConnectWalletButton({children = null, asModal = false, forceLogin = false,}) {
  const { t } = useTranslation(["common", "connect-wallet-button"]);

  const {dispatch, state: { loading, connectedChain },} = useAppState();
  const [showModal, setShowModal] = useState(false);

  const {state} = useAppState();

  const { connectWallet } = useAuthentication();

  async function handleLogin()  {
    if(!window?.ethereum) {
      dispatch(changeShowWeb3(true))
      return;
    }

    if (!state.Service?.active)
      return;

    if (+state.connectedChain?.id === +state.Settings?.requiredChain?.id) {
      connectWallet();
    } else {
      console.log('no connected chain?', connectedChain, state.Settings?.requiredChain);

      dispatch(changeChain.update({...state.connectedChain, id: state.Settings?.requiredChain?.id}));
      setShowModal(false);
    }
  }

  function handleShowModal() {
    if (!state.currentUser?.walletAddress) setShowModal(true);
    else setShowModal(false);
  }

  useEffect(() => {
    if (!state.Service?.active) return;

    if (forceLogin)
      connectWallet();

  }, [state.Service?.active, forceLogin]);

  useEffect(() => {
    handleShowModal();
  }, [state.currentUser?.walletAddress]);


  if (asModal) {
    if (loading?.isLoading) return <></>;

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
              style={{ color: NetworkColors[state.Settings?.requiredChain?.name?.toLowerCase()] }}
            >
              <span>{state.Settings?.requiredChain?.name}</span>{" "}
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
        onClick={handleLogin}
      >
        <span>{t("main-nav.connect")}</span>
      </Button>
    );

  return children;
}
