import React, {useEffect, useState} from "react";
import {Spinner} from "react-bootstrap";

import {useTranslation} from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import TermsAndConditions from "components/common/terms-and-conditions/view";
import ConnectWalletButton from "components/connect-wallet-button";
import Modal from "components/modal";
import SelectChainDropdown from "components/select-chain-dropdown";

import {useAppState} from "contexts/app-state";
import { changeNeedsToChangeChain } from "contexts/reducers/change-spinners";
import { updateSupportedChains } from "contexts/reducers/change-supported-chains";

import { MINUTE_IN_MS, UNSUPPORTED_CHAIN } from "helpers/constants";

import {SupportedChainData} from "interfaces/supported-chain-data";

import { useGetChains } from "x-hooks/api/chain";
import { useDao } from "x-hooks/use-dao";
import useNetworkChange from "x-hooks/use-network-change";
import useReactQuery from "x-hooks/use-react-query";

type typeError = { code?: number; message?: string }

export default function WrongNetworkModal() {
  const { t } = useTranslation("common");
  const { query, pathname } = useRouter();

  const [error, setError] = useState<string>("");
  const [_showModal, setShowModal] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [networkChain, setNetworkChain] = useState<SupportedChainData>(null);
  const [chosenSupportedChain, setChosenSupportedChain] = useState<SupportedChainData>(null);

  const { connect } = useDao();
  const { handleAddNetwork } = useNetworkChange();
  const {
    dispatch,
    state: { connectedChain, currentUser, Service, supportedChains, loading, spinners }
  } = useAppState();

  useReactQuery(["supportedChains"], () => useGetChains().then(chains => { 
    dispatch(updateSupportedChains(chains));
    return chains; 
  }), {
    staleTime: MINUTE_IN_MS
  });

  const isRequired = [
    pathname?.includes("new-network"),
    pathname?.includes("/[network]/[chain]/profile")
  ].some(c => c);

  const canBeHided = !isRequired;

  function changeShowModal() {
    if (!supportedChains?.length || loading?.isLoading) {
      setShowModal(false);
      return;
    }

    setShowModal([
      spinners?.needsToChangeChain,
      connectedChain?.matchWithNetworkChain === false && isRequired,
      connectedChain?.name === UNSUPPORTED_CHAIN && isRequired
    ].some(c => c));
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
      .then(() => {
        if (!currentUser?.walletAddress)
          return connect();
      })
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
        dispatch(changeNeedsToChangeChain(false));
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

  function handleHideModal() {
    dispatch(changeNeedsToChangeChain(false));
  }

  const isButtonDisabled = () => [isAddingNetwork].some((values) => values);

  useEffect(updateNetworkChain, [Service?.network?.active?.chain_id, supportedChains, query?.network]);
  useEffect(changeShowModal, [
    currentUser?.walletAddress,
    connectedChain?.matchWithNetworkChain,
    connectedChain?.id,
    supportedChains,
    loading,
    spinners,
    isRequired
  ]);

  if ((spinners?.needsToChangeChain || _showModal) && !currentUser?.walletAddress)
    return <ConnectWalletButton asModal={true} />;

  return (
    <Modal
      title={t("modals.wrong-network.change-network")}
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={_showModal}
      onCloseClick={canBeHided ? handleHideModal : undefined}
    >
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
          {networkChain ? t("modals.wrong-network.connect-to-network-chain") : t("modals.wrong-network.please-connect")}
        </strong>

        {!isAddingNetwork ? '' :
          <Spinner
            className="text-primary align-self-center p-2 mt-1 mb-2"
            style={{ width: "5rem", height: "5rem" }}
            animation="border"
          />
        }

        <SelectChainDropdown
          defaultChain={networkChain}
          onSelect={selectSupportedChain}
          isDisabled={isAddingNetwork}
          placeHolder={t("forms.select-placeholder-chain")}
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

        <TermsAndConditions />
      </div>
    </Modal>
  );
}
