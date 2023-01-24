import React, {useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";

import {useTranslation} from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import Modal from "components/modal";
import SelectNetworkDropdown from "components/select-network-dropdown";

import {useAppState} from "contexts/app-state";

import {SupportedChainData} from "interfaces/supported-chain-data";

import useApi from "x-hooks/use-api";
import UseNetworkChange from "x-hooks/use-network-change";

type typeError = { code?: number; message?: string }

export default function WrongNetworkModal() {
  const { t } = useTranslation("common");
  const { query } = useRouter();

  const [error, setError] = useState<string>("");
  const [_showModal, setShowModal] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [networkChain, setNetworkChain] = useState<SupportedChainData>(null);
  const [chosenSupportedChain, setChosenSupportedChain] = useState<SupportedChainData>(null);
  
  const api = useApi();
  const { handleAddNetwork } = UseNetworkChange();
  const { state: { connectedChain, currentUser, Service, supportedChains, loading, spinners } } = useAppState();

  function changeShowModal() {
    if (!connectedChain?.id || 
        !supportedChains?.length ||
        loading?.isLoading ||
        spinners?.changingChain) {
      setShowModal(false);
      return;
    }

    if (typeof connectedChain?.matchWithNetworkChain !== "boolean" && !!currentUser?.walletAddress)
      setShowModal(!supportedChains?.find(({ chainId }) => +chainId === +connectedChain.id));
    else
      setShowModal(!connectedChain?.matchWithNetworkChain && !!currentUser?.walletAddress);

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

  function updateNetworkChain() {
    if (supportedChains?.length && Service?.network?.active?.chain_id && query?.network) {
      const chain = supportedChains.find(({ chainId }) => +Service?.network?.active?.chain_id === +chainId );
      
      setNetworkChain(chain);
      setChosenSupportedChain(chain);
    }
    else
      setNetworkChain(null);
  }

  const isButtonDisabled = (): boolean =>
    [isAddingNetwork].some((values) => values);

  useEffect(() => { api.getSupportedChains() }, []);
  useEffect(updateNetworkChain, [Service?.network?.active?.chain_id, supportedChains, query?.network]);
  useEffect(changeShowModal, [
    currentUser?.walletAddress, 
    connectedChain?.matchWithNetworkChain, 
    connectedChain?.id,
    supportedChains,
    loading,
    spinners
  ]);

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
          <Spinner 
            className="text-primary align-self-center p-2 mt-1 mb-2"
            style={{ width: "5rem", height: "5rem" }}
            animation="border"
          />
        }

        <SelectNetworkDropdown
          defaultChain={networkChain}
          onSelect={selectSupportedChain}
          isDisabled={isAddingNetwork}
        />

        <Button 
          className="my-3"
          disabled={isButtonDisabled()}
          onClick={_handleAddNetwork}
        >
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
