import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import { FormGroup } from "components/form-group";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import { WarningSpan } from "components/warning-span";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

export default function RegistrySettings({ isGovernorRegistry = false }) {
  const { t } = useTranslation(["common", "custom-network", "setup"]);
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState<string>()
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState<string>()
  const { fields, settings } = useNetworkSettings();
  const {state} = useAppState();
  const { updateActiveNetwork } = useNetwork();
  const { handleFeeSettings, handleAmountNetworkCreation, handleFeeNetworkCreation } = useBepro();

  async function saveFeeSettings() {
    await handleFeeSettings(settings?.treasury?.closeFee?.value,
                            settings?.treasury?.cancelFee?.value).then(() => updateActiveNetwork(true));
  }

  async function saveCreateNetworkFee() {
    await handleFeeNetworkCreation(Number(networkCreationFeePercentage)/100)
  }

  async function saveCreateNetworkAmount() {
    await handleAmountNetworkCreation(lockAmountForNetworkCreation)
  }

  useEffect(() => {
    if(!state.Service?.active) return;

    state.Service.active.getRegistryCreatorAmount().then(v => setLockAmountForNetworkCreation(v.toFixed()))
    state.Service.active.getRegistryCreatorFee().then(v => v.toString()).then(setNetworkCreationFeePercentage)
    
  },[state.Service.active])

  function exceedsFeesLimitsError(fee) {
    if (+fee < 0 || +fee > 100)
      return t("setup:registry.errors.exceeds-limit");

    return undefined;
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
      <Row className="mb-2">
        <Col>
          <FormGroup
            label={t("setup:registry.fields.network-creation-fee.label")}
            placeholder="0"
            symbol="%"
            value={networkCreationFeePercentage}
            onChange={setNetworkCreationFeePercentage}
            variant="numberFormat"
            description={t("setup:registry.fields.network-creation-fee.description")}
            error={exceedsFeesLimitsError(networkCreationFeePercentage)}
            readOnly={!isGovernorRegistry}
          />
        </Col>
        {isGovernorRegistry && (
          <Col xs={5}>
            <Button 
            className="mt-4" 
            onClick={saveCreateNetworkFee} 
            disabled={exceedsFeesLimitsError(networkCreationFeePercentage) ? true : false}
            >
              <span>{t("custom-network:registry.save-create-network-fee")}</span>
            </Button>
          </Col>
        )}
      </Row>
      <Row className="mb-2">
        <FormGroup
          label={t("setup:registry.fields.network-creation-amount.label")}
          placeholder="0"
          value={lockAmountForNetworkCreation}
          onChange={setLockAmountForNetworkCreation}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-amount.description")}
          readOnly={!isGovernorRegistry}
        />
        {isGovernorRegistry && (
          <Col xs={5}>
            <Button onClick={saveCreateNetworkAmount} className="mt-4">
            <span>{t("custom-network:registry.save-create-network-amount")}</span>
            </Button>
          </Col>
        )}
      </Row>

      {isGovernorRegistry && <TokensSettings isGovernorRegistry={true} />}
    </>
  );
}
