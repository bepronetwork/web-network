import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import { Network } from "interfaces/network";
import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

interface GovernanceProps {
  address: string;
  tokens: Token[];
  network: Network;
  updateEditingNetwork: () => void;
}

export default function GovernanceSettings({
  network,
  tokens,
  address,
  updateEditingNetwork
}: GovernanceProps) {
  const { t } = useTranslation(["common", "custom-network"]);
  const [isClosing, setIsClosing] = useState(false);
  const {state, dispatch} = useAppState();
  const { updateNetwork } = useApi();
  const { handleCloseNetwork } = useBepro();
  const { updateWalletBalance } = useAuthentication();
  const { updateActiveNetwork } = useNetwork();
  const {
    isAbleToClosed,
  } = useNetworkSettings();
  const [networkToken, setNetworkToken] = useState<Token[]>();

  const isCurrentNetwork = (!!network &&
    !!state.Service?.network?.active &&
    network?.networkAddress === state.Service?.network?.active?.networkAddress)

  function handleCloseMyNetwork() {
    if (
      !state.Service?.network?.active ||
      !state.currentUser?.login ||
      !state.currentUser?.accessToken ||
      !state.currentUser?.walletAddress ||
      !state.Service?.active
    )
      return;

    setIsClosing(true);

    handleCloseNetwork()
      .then(() => {
        return updateNetwork({
          githubLogin: state.currentUser.login,
          isClosed: true,
          creator: state.currentUser.walletAddress,
          networkAddress: network?.networkAddress,
          accessToken: state.currentUser?.accessToken,
        });
      })
      .then(() => {
        updateWalletBalance(true);

        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .then(() =>
        dispatch(toastSuccess(t("custom-network:messages.network-closed"),
                              t("actions.success"))))
      .catch((error) =>
        dispatch(toastError(t("custom-network:errors.failed-to-close-network", { error }),
                            t("actions.failed"))))
      .finally(() => {
        setIsClosing(false);
      });
  }

  useEffect(() => {
    if(tokens.length > 0) setNetworkToken(tokens.map((token) => ({
      ...token,
      isReward: !!token.network_tokens.isReward,
      isTransactional: !!token.network_tokens.isTransactional
    })))
  }, [tokens]);

  return (
    <>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:network-info")}
        </span>
        <Col>
          <label className="caption-small mb-2">
            {t("custom-network:network-address")}
          </label>
          <input
            type="text"
            className="form-control"
            value={address}
            disabled={true}
          />
        </Col>
        <Col className="d-flex align-items-center justify-content-end">
          <Button
            color="dark-gray"
            disabled={!isAbleToClosed || isClosing || !state.currentUser?.login}
            className="ml-2"
            onClick={handleCloseMyNetwork}
            isLoading={isClosing}
            withLockIcon={!isAbleToClosed || !state.currentUser?.login}
          >
            <span>{t("custom-network:close-network")}</span>
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
       <TokensSettings defaultSelectedTokens={networkToken} />
      </Row>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>

        <NetworkContractSettings />
      </Row>
    </>
  );
}
