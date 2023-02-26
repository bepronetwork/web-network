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

import { ParameterValidator, REGISTRY_LIMITS } from "helpers/registry";

import { RegistryParameters } from "types/dappkit";

import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

type Executing = "bountyFees" | "creationFee" | "creationAmount";

export default function RegistrySettings({ isGovernorRegistry = false }) {
  const { t } = useTranslation(["common", "custom-network", "setup"]);

  const [executingTx, setExecutingTx] = useState<Executing>();
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState<string>();
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState<string>();
  
  const {state} = useAppState();
  const { updateActiveNetwork } = useNetwork();
  const { fields, settings } = useNetworkSettings();
  const { handleFeeSettings, handleAmountNetworkCreation, handleFeeNetworkCreation } = useBepro();

  function validateLimits(param: RegistryParameters, value: string | number) {
    if (ParameterValidator(param, value)) return undefined;

    const { min, max } = REGISTRY_LIMITS[param] || {};

    if (min !== undefined && max !== undefined)
      return t("setup:registry.errors.exceeds-limit", { min, max });
    else
      return t("setup:registry.errors.greater-than", { min });
  }

  const params = {
    creationFee: {
      isExecuting: executingTx === "creationFee",
      error: validateLimits("networkCreationFeePercentage", networkCreationFeePercentage)
    },
    creationAmount: {
      isExecuting: executingTx === "creationAmount",
      error: validateLimits("lockAmountForNetworkCreation", lockAmountForNetworkCreation)
    },
    closeFee: {
      isExecuting: executingTx === "bountyFees",
      error: validateLimits("closeFeePercentage", settings?.treasury?.closeFee?.value)
    },
    cancelFee: {
      isExecuting: executingTx === "bountyFees",
      error: validateLimits("cancelFeePercentage", settings?.treasury?.cancelFee?.value)
    }
  };

  const isExecuting = Object.entries(params).map(([, {isExecuting}]) => isExecuting).some(c => c);

  const isSaveBountyFeesBtnDisabled = !!params.closeFee.error || !!params.cancelFee.error || isExecuting;
  const isSaveCreationFeeBtnDisabled = !!params.creationFee.error || isExecuting;
  const isSaveCreationAmountBtnDisabled = !!params.creationAmount.error || isExecuting;

  async function saveFeeSettings() {
    setExecutingTx("bountyFees");

    handleFeeSettings(settings?.treasury?.closeFee?.value, settings?.treasury?.cancelFee?.value)
      .then(() => updateActiveNetwork(true))
      .catch(console.debug)
      .finally(() => setExecutingTx(undefined));
  }

  async function saveCreateNetworkFee() {
    setExecutingTx("creationFee");

    await handleFeeNetworkCreation(Number(networkCreationFeePercentage) / 100)
      .then(() => updateActiveNetwork(true))
      .catch(console.debug)
      .finally(() => setExecutingTx(undefined));
  }

  async function saveCreateNetworkAmount() {
    setExecutingTx("creationAmount");

    await handleAmountNetworkCreation(lockAmountForNetworkCreation)
      .then(() => updateActiveNetwork(true))
      .catch(console.debug)
      .finally(() => setExecutingTx(undefined));
  }

  useEffect(() => {
    if(!state.Service?.active) return;

    state.Service.active.getRegistryCreatorAmount().then(v => setLockAmountForNetworkCreation(v.toFixed()))
    state.Service.active.getRegistryCreatorFee().then(v => v.toString()).then(setNetworkCreationFeePercentage)
    
  },[state.Service.active]);

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
            description={t("custom-network:steps.treasury.fields.cancel-fee.description")}
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
            description={t("custom-network:steps.treasury.fields.close-fee.description")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            error={settings?.treasury?.closeFee?.validated === false}
            onChange={fields.closeFee.setter}
          />
        </Col>
        {isGovernorRegistry && (
          <Col xs={4}>
            <Button 
              onClick={saveFeeSettings} 
              className="mt-4"
              disabled={isSaveBountyFeesBtnDisabled}
              withLockIcon={isSaveBountyFeesBtnDisabled && !params.cancelFee.isExecuting}
              isLoading={params.cancelFee.isExecuting}
            >
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
            error={params.creationFee.error}
            readOnly={!isGovernorRegistry}
          />
        </Col>
        {isGovernorRegistry && (
          <Col xs={5}>
            <Button 
            className="mt-4" 
            onClick={saveCreateNetworkFee} 
            disabled={isSaveCreationFeeBtnDisabled}
            withLockIcon={isSaveCreationFeeBtnDisabled && !params.creationFee.isExecuting}
            isLoading={params.creationFee.isExecuting}
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
          error={params.creationAmount.error}
        />
        {isGovernorRegistry && (
          <Col xs={5}>
            <Button 
              onClick={saveCreateNetworkAmount} 
              className="mt-4"
              disabled={isSaveCreationAmountBtnDisabled}
              withLockIcon={isSaveCreationAmountBtnDisabled && !params.creationAmount.isExecuting}
              isLoading={params.creationAmount.isExecuting}
            >
              <span>{t("custom-network:registry.save-create-network-amount")}</span>
            </Button>
          </Col>
        )}
      </Row>
      {!isGovernorRegistry && (
          <Row className="mb-4">
            <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
            />
          </Row>
        )}

      {isGovernorRegistry && <TokensSettings isGovernorRegistry={true} />}
    </>
  );
}
