import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import TokensSettings from "components/tokens-settings";

import { useNetworkSettings } from "contexts/network-settings";

import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

export default function RegistryGovernorSettings() {
  const { t } = useTranslation(["common", "custom-network"]);
  const { fields, settings } = useNetworkSettings();

  const { updateActiveNetwork } = useNetwork();
  const { handleFeeSettings } = useBepro()

  
  async function saveFeeSettings() {
    await handleFeeSettings(settings?.treasury?.closeFee?.value,
                            settings?.treasury?.cancelFee?.value)
                            .then(() => updateActiveNetwork(true))
  }

  return (
    <>
      <Row className="mb-3">
        <h3 className="text-capitalize family-Regular text-white">
          {t("custom-network:registry.title-governor")}
        </h3>
      </Row>

      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">{t("custom-network:registry.config-fees")}</span>

        <Col>
          <NetworkParameterInput
            key="cancel-fee"
            label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
            symbol="%"
            value={settings?.treasury?.cancelFee?.value}
            error={settings?.treasury?.cancelFee?.validated === false}
            onChange={fields.cancelFee.setter}
          />
        </Col>

        <Col>
          <NetworkParameterInput
          key="close-fee"
            label={t("custom-network:steps.treasury.fields.close-fee.label")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            error={settings?.treasury?.closeFee?.validated === false}
            onChange={fields.closeFee.setter}
          />
        </Col>
        <Col xs={4}>
          <Button onClick={saveFeeSettings} className="mt-4">
            <span>{t("custom-network:registry.save-fees-config")}</span>
          </Button>
        </Col>
      </Row>

      <TokensSettings isGovernorRegistry={true} />
    </>
  );
}
