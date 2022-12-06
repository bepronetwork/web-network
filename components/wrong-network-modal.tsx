import React, {useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import Modal from "components/modal";

import {useAppState} from "contexts/app-state";

import Button from "./button";
import useApi from "../x-hooks/use-api";
import {SupportedChainData} from "../interfaces/supported-chain-data";
import SelectNetworkDropdown from "./select-network-dropdown";
import UseNetworkChange from "../x-hooks/use-network-change";

type typeError = { code?: number; message?: string }

export default function WrongNetworkModal() {
  const { t } = useTranslation("common");
  const api = useApi();
  const [error, setError] = useState<string>("");
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [_showModal, setShowModal] = useState(false);
  const [option, setOption] = useState<{ value: string; label: string }>(null);
  const [chosenSupportedChain, setChosenSupportedChain] = useState<SupportedChainData>(null);

  const {state: { connectedChain, currentUser, Settings: settings, supportedChains },} = useAppState();

  const {handleAddNetwork} = UseNetworkChange()

  function changeShowModal() {
    console.log('connectedChain', connectedChain)
    if (!supportedChains.length || !connectedChain?.id || !currentUser?.connected)
      return;

    if (!supportedChains.find(o => o.chainId === +option?.value))
      setOption(null);

    setShowModal(!supportedChains.find(({chainId}) => chainId === +connectedChain?.id));
  }

  async function selectSupportedChain(chain: SupportedChainData) {
    if (!chain)
      return;

    setChosenSupportedChain(chain);
  }

  async function _handleAddNetwork() {
    setIsAddingNetwork(true);
    setError("");
    handleAddNetwork(chosenSupportedChain)
      .catch(error => {
        if ((error as typeError).code === -32602) {
          setError(t("modals.wrong-network.error-invalid-rpcUrl"));
        }
        if ((error as typeError).code === -32603) {
          setError(t("modals.wrong-network.error-failed-rpcUrl"));
        }
      })
      .finally(() => {
        setIsAddingNetwork(false);
      });
  }

  const isButtonDisabled = (): boolean =>
    [isAddingNetwork].some((values) => values);

  useEffect(() => { api.getSupportedChains() }, []);
  useEffect(changeShowModal, [supportedChains, connectedChain]);

  return (
    <Modal
      title={t("modals.wrong-network.change-network")}
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={_showModal}>
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
          {t("modals.wrong-network.please-connect")}
        </strong>
        {!isAddingNetwork ? '' :
          <Spinner className="text-primary align-self-center p-2 mt-1 mb-2"
                   style={{ width: "5rem", height: "5rem" }}
                   animation="border"/>
        }

        <SelectNetworkDropdown onSelect={selectSupportedChain} />

        <Button className="my-3"
                disabled={isButtonDisabled()}
                onClick={_handleAddNetwork}>
          {t("modals.wrong-network.change-network")}
        </Button>
        {error && (
          <p className="caption-small text-uppercase text-danger">{error}</p>
        )}
        <div className="small-info text-light-gray text-center fs-smallest text-dark text-uppercase mt-1 pt-1">
          {t("misc.by-connecting")}{" "}
          <a
            href="https://www.bepro.network/terms"
            target="_blank"
            className="text-decoration-none"
            rel="noreferrer"
          >
            {t("misc.terms-and-conditions")}
          </a>{" "}
          <br /> {t("misc.and")}{" "}
          <a
            href="https://taikai.network/privacy"
            target="_blank"
            className="text-decoration-none"
            rel="noreferrer"
          >
            {t("misc.privacy-policy")}
          </a>
        </div>
      </div>
    </Modal>
  );
}
