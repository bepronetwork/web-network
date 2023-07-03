import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import Card from "components/card";
import CopyButton from "components/common/buttons/copy/controller";
import ContractButton from "components/contract-button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import {FormGroup} from "components/form-group";
import If from "components/If";
import LoadingGlobal from "components/loading-global";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import {WarningSpan} from "components/warning-span";

import {useAppState} from "contexts/app-state";

import {REGISTRY_LIMITS, RegistryValidator} from "helpers/registry";

import { RegistryEvents } from "interfaces/enums/events";
import { Token } from "interfaces/token";

import {RegistryParameters} from "types/dappkit";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import {useNetwork} from "x-hooks/use-network";

type Executing = "bountyFees" | "creationFee" | "creationAmount" | "transactional" | "reward";

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

  const [executingTx, setExecutingTx] = useState<Executing>();
  const [registryTokenSymbol, setRegistryTokenSymbol] = useState<string>();

  const [treasuryAddress, setTreasuryAddress] = useState<string>();
  const [allowedReward, setAllowedReward] = useState<Field>(defaultField);
  const [closeFeePercentage, setCloseFeePercentage] = useState<Field>(defaultField);
  const [cancelFeePercentage, setCancelFeePercentage] = useState<Field>(defaultField);
  const [allowedTransactional, setAllowedTransactional] = useState<Field>(defaultField);
  const [transactionalTokens, setTransactionalTokens] = useState<Token[]>([]);
  const [rewardTokens, setRewardTokens] = useState<Token[]>([]);
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState<Field>(defaultField);
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState<Field>(defaultField);

  const {state} = useAppState();
  const { processEvent, createToken } = useApi();
  const { updateActiveNetwork } = useNetwork();
  const { 
    handleFeeSettings,
    handleAmountNetworkCreation,
    handleFeeNetworkCreation,
    handleChangeAllowedTokens
  } = useBepro();
  const { signMessage } = useAuthentication();

  function isSameAdresses(adressesA: string[], adressesB: string[]) {
    return [...adressesA as string[]].sort().join() === [...adressesB as string[]].sort().join();
  }

  const isExecuting = !!executingTx;
  const isFieldsDisabled = !isGovernorRegistry || isExecuting;

  const changingLabels = {
    "bountyFees": t("setup:registry.changing-labels.bounty-fees"),
    "creationFee": t("setup:registry.changing-labels.network-creation-fee"),
    "creationAmount": t("setup:registry.changing-labels.network-creation-amount"),
    "transactional": t("setup:registry.changing-labels.transactional"),
    "reward": t("setup:registry.changing-labels.reward"),
  };

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

  async function updateRegistryParameters() {
    return Promise.all([
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
  }

  async function handleTokensTransactions({ value, originalValue }: Field, isTransactional = true) {
    const diff = (arrA, arrB) => arrA.filter(e => !arrB.includes(e)); 

    const blocks = [];
    const toAdd = diff(value, originalValue);
    const toRemove = diff(originalValue, value);

    const getBlock = ({ blockNumber }) => blocks.push(blockNumber);

    const findMinAmount = (tokens: Token[], newAddress: string) =>
      tokens.find(({ address }) => address.toLowerCase() === newAddress.toLowerCase());

    if (toAdd.length){
      await Promise.all(toAdd.map(async (address) => {
        const currentToken = findMinAmount(isTransactional ? transactionalTokens : rewardTokens, address)
        if(currentToken?.minimum !== '0'){
          await signMessage();
          return createToken({address, minAmount: currentToken?.minimum, chainId: +state.connectedChain.id})
        }
      }))

      await handleChangeAllowedTokens(toAdd, isTransactional)
        .then(getBlock)
        .catch(error => console.debug("Failed to add tokens", error));
    }

    if (toRemove.length)
      await handleChangeAllowedTokens(toRemove, isTransactional, false)
        .then(getBlock)
        .catch(error => console.debug("Failed to remove tokens", error));

    return blocks as number[];
  }

  async function processChanges() {
    if (!changedFields.length || hasError) return;

    const wasChanged = parameter => changedFields.includes(parameter);

    if (wasChanged("closeFeePercentage") || wasChanged("cancelFeePercentage")) {
      setExecutingTx("bountyFees");

      await handleFeeSettings(closeFeePercentage.value as number, cancelFeePercentage.value  as number)
        .catch(error => console.debug("Failed to update bounty fees", error));
    }

    if (wasChanged("networkCreationFeePercentage")) {
      setExecutingTx("creationFee");

      await handleFeeNetworkCreation(networkCreationFeePercentage.value as number)
        .catch(error => console.debug("Failed to update creation amount", error));
    }

    if (wasChanged("lockAmountForNetworkCreation")) {
      setExecutingTx("creationAmount");

      await handleAmountNetworkCreation(lockAmountForNetworkCreation.value as string)
        .catch(error => console.debug("Failed to update creation amount", error));
    }

    const tokensBlocks = [] as number[];

    if (wasChanged("allowedTransactional")) {
      setExecutingTx("transactional");

      tokensBlocks.push(...(await handleTokensTransactions(allowedTransactional, true)));
    }

    if (wasChanged("allowedReward")) {
      setExecutingTx("reward");
      
      tokensBlocks.push(...(await handleTokensTransactions(allowedReward, false)));
    }

    if (tokensBlocks.length) {
      const ordered = [...tokensBlocks].sort();

      await processEvent(RegistryEvents.ChangeAllowedTokens, undefined, { 
        fromBlock: ordered.shift(),
        toBlock: ordered.pop()
      });
    }

    setExecutingTx(undefined);

    await updateActiveNetwork(true);
    await updateRegistryParameters();
  }

  function onTokensChanged(transactional: Token[], reward: Token[]) {
    const rwdAddresses = reward?.map(({ address }) => address?.toLowerCase());
    const trsAddresses = transactional?.map(({ address }) => address?.toLowerCase());

    setTransactionalTokens(transactional)
    setRewardTokens(reward)
    
    setAllowedReward(previous => ({
      ...previous,
      value: rwdAddresses
    }));

    setAllowedTransactional(previous => ({
      ...previous,
      value: trsAddresses
    }));
  }

  useEffect(() => {
    if(!state.Service?.active?.network?.contractAddress) return;

    updateRegistryParameters();
  },[state.Service?.active?.network?.contractAddress]);

  return (
    <>
      <LoadingGlobal show={isExecuting} dialogClassName="modal-md">
        {t("misc.changing")} {changingLabels[executingTx]}
      </LoadingGlobal>

      <Row className="my-3 align-items-center">
        <Col>
          <span className="caption-large text-white text-capitalize font-weight-medium mb-3">
            {isGovernorRegistry
              ? t("custom-network:registry.config-fees")
              : t("custom-network:steps.network-settings.fields.fees.title")}
          </span>
        </Col>
        
        <If condition={isGovernorRegistry}>
          <Col xs="auto">
            <ContractButton
              className="border-radius-4"
              disabled={!changedFields.length || hasError || isExecuting}
              onClick={processChanges}
            >
              {t("misc.save-changes")}
            </ContractButton>
          </Col>
        </If>
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

      <If condition={isGovernorRegistry}>
        <TokensSettings 
          isGovernorRegistry={true}
          disabled={isFieldsDisabled}
          onChangeCb={onTokensChanged}
        />
      </If>

      <Row 
        xs="1"
        sm="2"
        md="4"
        className="align-items-top mt-4 mb-5"
      >
        <NetworkParameterInput
          disabled={isFieldsDisabled}
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
          disabled={isFieldsDisabled}
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
          disabled={isFieldsDisabled}
        />

        <FormGroup
          label={t("setup:registry.fields.network-creation-amount.label")}
          placeholder="0"
          value={lockAmountForNetworkCreation?.value?.toString()}
          onChange={handleChange("lockAmountForNetworkCreation")}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-amount.description")}
          disabled={isFieldsDisabled}
          error={lockAmountForNetworkCreation?.error}
          symbol={registryTokenSymbol}
        />
      </Row>

      <If condition={!isGovernorRegistry}>
        <Row className="mb-4">
          <WarningSpan
            text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
          />
        </Row>
      </If>
    </>
  );
}
