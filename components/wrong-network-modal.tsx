import { useContext, useState } from "react";
import { Spinner } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";

import { NETWORKS } from "helpers/networks";

import { NetworkColors } from "interfaces/enums/network-colors";

import Button from "./button";
const { networkIds, metaMask } = getConfig().publicRuntimeConfig;

export default function WrongNetworkModal({
  requiredNetworkId = null,
}: {
  requiredNetworkId: number;
}) {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [error, setError] = useState<string>("");
  const { t } = useTranslation("common");

  const {
    state: { networkId: activeNetworkId },
  } = useContext(ApplicationContext);

  function showModal() {
    return (
      !!activeNetworkId &&
      !!requiredNetworkId &&
      +activeNetworkId !== +requiredNetworkId
    );
  }

  async function handleAddNetwork() {
    setIsAddingNetwork(true);
    setError("");
    const chainId = `0x${Number(metaMask.chainId).toString(16)}`;
    const currencyNetwork = NETWORKS[chainId];
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: chainId,
          },
        ],
      });
    } catch (error) {
      if ((error as { code?: number}).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainId,
                chainName: currencyNetwork.name,
                nativeCurrency: {
                  name: currencyNetwork.currency.name,
                  symbol: currencyNetwork.currency.symbol,
                  decimals: currencyNetwork.decimals,
                },
                rpcUrls: currencyNetwork.rpcUrls,
                blockExplorerUrls: [currencyNetwork.explorerURL],
              },
            ],
          });
        } catch (error) {
          if ((error as { code?: number}).code === -32602) {
            setError(t("modals.wrong-network.error-invalid-rpcUrl"));
          }
          if ((error as { code?: number}).code === -32603) {
            setError(t("modals.wrong-network.error-failed-rpcUrl"));
          }
        }
      }
    } finally {
      setIsAddingNetwork(false);
    }
  }

  const isButtonDisabled = (): boolean =>
    [isAddingNetwork].some((values) => values);

  return (
    <Modal
      title={t("modals.wrong-network.change-network")}
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={showModal()}
    >
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
          {t("modals.wrong-network.please-connect")}{" "}
          <span style={{ color: NetworkColors[networkIds[requiredNetworkId]] }}>
            <span>{networkIds[requiredNetworkId]}</span>{" "}
            {t("modals.wrong-network.network")}
          </span>
          <br /> {t("modals.wrong-network.on-your-wallet")}
        </strong>
        {(isAddingNetwork && (
          <Spinner
            className="text-primary align-self-center p-2 mt-1 mb-2"
            style={{ width: "5rem", height: "5rem" }}
            animation="border"
          />
        )) ||
          ""}
        <Button
          className="my-3"
          disabled={isButtonDisabled()}
          onClick={handleAddNetwork}
        >
          {t("modals.wrong-network.change-network")}
        </Button>
        {error && (
          <p className="caption-small text-uppercase text-danger">{error}</p>
        )}
        <div className="small-info text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-1 pt-1">
          {t("misc.by-connecting")}{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none"
            rel="noreferrer"
          >
            {t("misc.terms-and-conditions")}
          </a>{" "}
          <br /> {t("misc.and")}{" "}
          <a
            href="https://www.bepro.network/privacy"
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
