import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import { WarningSpan } from "components/warning-span";

import { useNetworkSettings } from "contexts/network-settings";

import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

export default function RegistrySettings({ isGovernorRegistry = false }) {
  const { t } = useTranslation(["common", "custom-network"]);
  const { fields, settings } = useNetworkSettings();

  const { updateActiveNetwork } = useNetwork();
  const { handleFeeSettings } = useBepro();

  async function saveFeeSettings() {
    await handleFeeSettings(settings?.treasury?.closeFee?.value,
                            settings?.treasury?.cancelFee?.value).then(() => updateActiveNetwork(true));
  }

  return (
    <>
      {isGovernorRegistry && (
        <Row className="mb-3">
          <h3 className="text-capitalize family-Regular text-white">
            {t("custom-network:registry.title-governor")}
          </h3>
        </Row>
      )}

      <Row className="mt-2">
        <span className="caption-medium text-white mb-3">
          {isGovernorRegistry
            ? t("custom-network:registry.config-fees")
            : t("custom-network:steps.network-settings.fields.fees.title")}
        </span>
        <Row className="mb-4">
          <Col xs={8}>
            <TreasuryAddressField
              value={settings?.treasury?.address?.value}
              onChange={fields.treasury.setter}
              validated={settings?.treasury?.address?.validated}
              disabled={true}
            />
          </Col>
        </Row>
        <Col>
          <NetworkParameterInput
            disabled={!isGovernorRegistry}
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
            disabled={!isGovernorRegistry}
            key="close-fee"
            label={t("custom-network:steps.treasury.fields.close-fee.label")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            error={settings?.treasury?.closeFee?.validated === false}
            onChange={fields.closeFee.setter}
          />
        </Col>

        {!isGovernorRegistry && (
          <Row className="mb-4">
            <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
            />
          </Row>
        )}
        {isGovernorRegistry && (
          <Col xs={4}>
            <Button onClick={saveFeeSettings} className="mt-4">
              <span>{t("custom-network:registry.save-fees-config")}</span>
            </Button>
          </Col>
        )}
      </Row>

      {isGovernorRegistry && <TokensSettings isGovernorRegistry={true} />}
    </>
  );
}
