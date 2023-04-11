import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import Button from "components/button";
import Card from "components/card";
import ContractButton from "components/contract-button";
import CopyButton from "components/copy-button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import {FormGroup} from "components/form-group";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import {WarningSpan} from "components/warning-span";

import {useAppState} from "contexts/app-state";
import {useNetworkSettings} from "contexts/network-settings";

import {REGISTRY_LIMITS, RegistryValidator} from "helpers/registry";

import {RegistryParameters} from "types/dappkit";

import useBepro from "x-hooks/use-bepro";
import {useNetwork} from "x-hooks/use-network";

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
    if (RegistryValidator(param, value)) return undefined;

    const { min, max } = REGISTRY_LIMITS[param] || {};

    if (min !== undefined && max !== undefined)
      return t("setup:registry.errors.exceeds-limit", { min, max });

    if (min)
      return t("setup:registry.errors.greater-than", { min });

    if (max)
      return t("setup:registry.errors.less-than", { max });

    return t("setup:registry.errors.missing-limits");
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

    await handleFeeNetworkCreation(Number(networkCreationFeePercentage))
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
      <Row className="my-3 align-items-center">
        <Col>
          <span className="caption-large text-white text-capitalize font-weight-medium mb-3">
            {isGovernorRegistry
              ? t("custom-network:registry.config-fees")
              : t("custom-network:steps.network-settings.fields.fees.title")}
          </span>
        </Col>
        
        <Col xs="auto">
          <Button
            className="border-radius-4"
            disabled
          >
            Save Changes
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs="6">
          <Card>
            <Row className="mb-3">
              <span className="caption-medium text-capitalize font-weight-medium text-gray-200">
                {t("custom-network:steps.treasury.fields.address.label")}
              </span>
            </Row>
            
            <Row className="align-items-center">
              <Col>
                <span className="caption-medium text-capitalize font-weight-normal text-gray-50">
                  {settings?.treasury?.address?.value}
                </span>
              </Col>

              <Col xs="auto">
                <CopyButton
                  value={settings?.treasury?.address?.value}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row className="align-items-center">
        <NetworkParameterInput
          disabled={!isGovernorRegistry}
          key="cancel-fee"
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.cancel-fee.description", REGISTRY_LIMITS["cancelFeePercentage"])
          }
          symbol="%"
          value={settings?.treasury?.cancelFee?.value}
          error={settings?.treasury?.cancelFee?.validated === false}
          onChange={fields.cancelFee.setter}
        />
          
        <NetworkParameterInput
          disabled={!isGovernorRegistry}
          key="close-fee"
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.close-fee.description", REGISTRY_LIMITS["closeFeePercentage"])
          }
          symbol="%"
          value={settings?.treasury?.closeFee?.value}
          error={settings?.treasury?.closeFee?.validated === false}
          onChange={fields.closeFee.setter}
        />

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
      </Row>

        {/* {isGovernorRegistry && (
          <Col xs={4}>
            <ContractButton 
              onClick={saveFeeSettings} 
              className="mt-4"
              disabled={isSaveBountyFeesBtnDisabled}
              withLockIcon={isSaveBountyFeesBtnDisabled && !params.cancelFee.isExecuting}
              isLoading={params.cancelFee.isExecuting}
            >
              <span>{t("custom-network:registry.save-fees-config")}</span>
            </ContractButton>
          </Col>
        )} */}
      {/* <Row className="mb-2">
        
        {isGovernorRegistry && (
          <Col xs={5}>
            <ContractButton 
            className="mt-4" 
            onClick={saveCreateNetworkFee} 
            disabled={isSaveCreationFeeBtnDisabled}
            withLockIcon={isSaveCreationFeeBtnDisabled && !params.creationFee.isExecuting}
            isLoading={params.creationFee.isExecuting}
            >
              <span>{t("custom-network:registry.save-create-network-fee")}</span>
            </ContractButton>
          </Col>
        )}
      </Row> */}
      {/* <Row className="mb-2">
        
        {isGovernorRegistry && (
          <Col xs={5}>
            <ContractButton 
              onClick={saveCreateNetworkAmount} 
              className="mt-4"
              disabled={isSaveCreationAmountBtnDisabled}
              withLockIcon={isSaveCreationAmountBtnDisabled && !params.creationAmount.isExecuting}
              isLoading={params.creationAmount.isExecuting}
            >
              <span>{t("custom-network:registry.save-create-network-amount")}</span>
            </ContractButton>
          </Col>
        )}
      </Row> */}
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
