import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import Button from "components/button";
import Card from "components/card";
import ContractButton from "components/contract-button";
import CopyButton from "components/copy-button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import {FormGroup} from "components/form-group";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import {WarningSpan} from "components/warning-span";

import {useAppState} from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

import {REGISTRY_LIMITS, RegistryValidator} from "helpers/registry";

import {RegistryParameters} from "types/dappkit";

import useBepro from "x-hooks/use-bepro";
import {useNetwork} from "x-hooks/use-network";

type Executing = "bountyFees" | "creationFee" | "creationAmount";

interface Field {
  value?: string | string[] | number;
  originalValue?: string | string[] | number;
  error?: string;
}

const defaultField = {
  value: "",
  originalValue: ""
};

export default function RegistrySettings({ isGovernorRegistry = false }) {
  const { t } = useTranslation(["common", "custom-network", "setup"]);

  const [executingTx, setExecutingTx] = useState<Executing>("bountyFees");
  const [registryTokenSymbol, setRegistryTokenSymbol] = useState<string>();

  const [treasuryAddress, setTreasuryAddress] = useState<string>();
  const [allowedReward, setAllowedReward] = useState<Field>(defaultField);
  const [closeFeePercentage, setCloseFeePercentage] = useState<Field>(defaultField);
  const [cancelFeePercentage, setCancelFeePercentage] = useState<Field>(defaultField);
  const [allowedTransactional, setAllowedTransactional] = useState<Field>(defaultField);
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState<Field>(defaultField);
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState<Field>(defaultField);

  const {state} = useAppState();
  const { tokens } = useNetworkSettings();
  const { updateActiveNetwork } = useNetwork();
  const { handleFeeSettings, handleAmountNetworkCreation, handleFeeNetworkCreation } = useBepro();

  function isSameAdresses(adressesA: string[], adressesB: string[]) {
    return [...adressesA as string[]].sort().join() === [...adressesB as string[]].sort().join();
  }

  const isExecuting = !!executingTx;

  const { changedFields, hasError } = [
    { field: "closeFeePercentage", data: closeFeePercentage },
    { field: "cancelFeePercentage", data: cancelFeePercentage },
    { field: "networkCreationFeePercentage", data: networkCreationFeePercentage },
    { field: "lockAmountForNetworkCreation", data: lockAmountForNetworkCreation },
    { field: "allowedReward", data: allowedReward },
    { field: "allowedTransactional", data: allowedTransactional },
  ].reduce((acc, curr) => {
    const { field, data: { value, originalValue, error } } = curr;

    const isChanged = Array.isArray(value) ? 
      !isSameAdresses(value, originalValue as string[]) : value?.toString() !== originalValue?.toString();

    return {
      changedFields: isChanged ? [...acc.changedFields, field] : acc.changedFields,
      hasError: acc.hasError || !!error
    }
  }, { changedFields: [], hasError: false });

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

  function handleChange(parameter) {
    const setters = {
      "closeFeePercentage": setCloseFeePercentage,
      "cancelFeePercentage": setCancelFeePercentage,
      "networkCreationFeePercentage": setNetworkCreationFeePercentage,
      "lockAmountForNetworkCreation": setLockAmountForNetworkCreation,
    };
    return(value => {
      setters[parameter](previous => ({
        ...previous,
        value,
        error: validateLimits(parameter, value)
      }));
    });
  }

  async function processChanges() {
    if (hasError) return;

    // { field: "closeFeePercentage", data: closeFeePercentage },
    // { field: "cancelFeePercentage", data: cancelFeePercentage },
    // { field: "networkCreationFeePercentage", data: networkCreationFeePercentage },
    // { field: "lockAmountForNetworkCreation", data: lockAmountForNetworkCreation },
    // { field: "allowedReward", data: allowedReward },
    // { field: "allowedTransactional", data: allowedTransactional },
  }

  // async function saveFeeSettings() {
  //   setExecutingTx("bountyFees");

  //   handleFeeSettings(settings?.treasury?.closeFee?.value, settings?.treasury?.cancelFee?.value)
  //     .then(() => updateActiveNetwork(true))
  //     .catch(console.debug)
  //     .finally(() => setExecutingTx(undefined));
  // }

  // async function saveCreateNetworkFee() {
  //   setExecutingTx("creationFee");

  //   await handleFeeNetworkCreation(Number(networkCreationFeePercentage))
  //     .then(() => updateActiveNetwork(true))
  //     .catch(console.debug)
  //     .finally(() => setExecutingTx(undefined));
  // }

  // async function saveCreateNetworkAmount() {
  //   setExecutingTx("creationAmount");

  //   await handleAmountNetworkCreation(lockAmountForNetworkCreation)
  //     .then(() => updateActiveNetwork(true))
  //     .catch(console.debug)
  //     .finally(() => setExecutingTx(undefined));
  // }

  useEffect(() => {
    if(!state.Service?.active?.network?.contractAddress) return;

    Promise.all([
      state.Service.active.getTreasury(),
      state.Service.active.getRegistryCreatorAmount(),
      state.Service.active.getRegistryCreatorFee(),
      state.Service.active.getAllowedTokens(),
    ])
      .then(([{ treasury, closeFee, cancelFee }, creationAmount, creationFee, { transactional, reward }]) => {
        const getField = (value) => ({ value, originalValue: value });
        const toLower = (value: string) => value.toLowerCase();

        setTreasuryAddress(treasury);
        setCloseFeePercentage(getField(closeFee));
        setCancelFeePercentage(getField(cancelFee));
        setNetworkCreationFeePercentage(getField(creationFee));
        setLockAmountForNetworkCreation(getField(creationAmount.toFixed()));
        setAllowedReward(previous => ({
          ...previous,
          originalValue: reward.map(toLower)
        }));
        setAllowedTransactional(previous => ({
          ...previous,
          originalValue: transactional.map(toLower)
        }));
      });
  },[state.Service?.active?.network?.contractAddress]);

  useEffect(() => {
    if (!tokens?.allowedRewards || !tokens?.allowedTransactions) return;
    
    const rwdAddresses = tokens?.allowedRewards?.map(({ address }) => address?.toLowerCase());
    const trsAddresses = tokens?.allowedTransactions?.map(({ address }) => address?.toLowerCase());

    if (isSameAdresses(rwdAddresses, trsAddresses)) return;

    setAllowedReward(previous => ({
      ...previous,
      value: tokens?.allowedRewards?.map(({ address }) => address)
    }));

    setAllowedTransactional(previous => ({
      ...previous,
      value: tokens?.allowedTransactions?.map(({ address }) => address)
    }));
  }, [tokens?.allowedRewards, tokens?.allowedTransactions]);

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
            disabled={!changedFields.length || hasError}
            onClick={processChanges}
          >
            Save Changes
          </Button>
        </Col>
      </Row>

      <Row className="mb-5">
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
                  {treasuryAddress}
                </span>
              </Col>

              <Col xs="auto">
                <CopyButton
                  value={treasuryAddress}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row 
        xs="1"
        sm="2"
        md="4"
        className="align-items-top mb-5"
      >
        <NetworkParameterInput
          disabled={!isGovernorRegistry || isExecuting}
          key="cancel-fee"
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.cancel-fee.description", REGISTRY_LIMITS["cancelFeePercentage"])
          }
          symbol="%"
          value={+cancelFeePercentage?.value}
          error={!!cancelFeePercentage?.error}
          errorMessage={cancelFeePercentage?.error}
          onChange={handleChange("cancelFeePercentage")}
        />
          
        <NetworkParameterInput
          disabled={!isGovernorRegistry || isExecuting}
          key="close-fee"
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.close-fee.description", REGISTRY_LIMITS["closeFeePercentage"])
          }
          symbol="%"
          value={+closeFeePercentage?.value}
          error={!!closeFeePercentage?.error}
          errorMessage={closeFeePercentage?.error}
          onChange={handleChange("closeFeePercentage")}
        />

        <FormGroup
          label={t("setup:registry.fields.network-creation-fee.label")}
          placeholder="0"
          symbol="%"
          value={networkCreationFeePercentage?.value?.toString()}
          onChange={handleChange("networkCreationFeePercentage")}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-fee.description")}
          error={networkCreationFeePercentage?.error}
          disabled={!isGovernorRegistry || isExecuting}
        />

        <FormGroup
          label={t("setup:registry.fields.network-creation-amount.label")}
          placeholder="0"
          value={lockAmountForNetworkCreation?.value?.toString()}
          onChange={handleChange("lockAmountForNetworkCreation")}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-amount.description")}
          disabled={!isGovernorRegistry || isExecuting}
          error={lockAmountForNetworkCreation?.error}
          symbol={registryTokenSymbol}
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

      {isGovernorRegistry && <TokensSettings isGovernorRegistry={true} disabled={!isGovernorRegistry || isExecuting} />}
    </>
  );
}
