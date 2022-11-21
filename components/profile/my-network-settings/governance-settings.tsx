import { ReactElement } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import NetworkContractSettings from "components/custom-network/network-contract-settings";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";

import { useNetworkSettings } from "contexts/network-settings";

import { Token } from "interfaces/token";

interface GovernanceProps {
  address: string;
  tokens: Token[];
}

export default function GovernanceSettings({
  tokens,
  address,
}: GovernanceProps) {
  const { t } = useTranslation(["common", "custom-network"]);
  console.log('tokens', tokens)
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
      </Row>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>

        <NetworkContractSettings />
      </Row>
      <Row className="mt-4">
        <TokensSettings defaultSelectedTokens={tokens} />
      </Row>
    </>
  );
}
