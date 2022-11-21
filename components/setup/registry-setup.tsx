import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import { ContextualSpan } from "components/contextual-span";
import { FormGroup } from "components/form-group";
import { CallToAction } from "components/setup/call-to-action";
import { ContractField, ContractInput } from "components/setup/contract-input";
import { DeployBountyTokenModal } from "components/setup/deploy-bounty-token-modal";
import { DeployERC20Modal } from "components/setup/deploy-erc20-modal";

import { useAppState } from "contexts/app-state";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useSettings } from "x-hooks/use-settings";

interface RegistrySetupProps { 
  isVisible?: boolean;
  registryAddress: string;
}

interface TokenAllowed {
  transactional: boolean;
  reward: boolean;
}

enum ModalKeys {
  ERC20 = "ERC20",
  BountyToken = "BountyToken"
}

const defaultContractField: ContractField = {
  value: "",
  validated: undefined
};

export function RegistrySetup({
  isVisible,
  registryAddress
} : RegistrySetupProps) {
  const { t } = useTranslation("setup");

  const [treasury, setTreasury] = useState("");
  const [erc20, setErc20] = useState(defaultContractField);
  const [visibleModal, setVisibleModal] = useState<string>();
  const [isAllowingToken, setIsAllowingToken] = useState<string>();
  const [registry, setRegistry] = useState(defaultContractField);
  const [closeFeePercentage, setCloseFeePercentage] = useState("");
  const [cancelFeePercentage, setCancelFeePercentage] = useState("");
  const [isErc20Allowed, setIsErc20Allowed] = useState<TokenAllowed>();
  const [bountyToken, setBountyToken] = useState(defaultContractField);
  const [isDeployingRegistry, setisDeployingRegistry] = useState(false);
  const [isSettingDispatcher, setIsSettingDisptacher] = useState(false);
  const [bountyTokenDispatcher, setBountyTokenDispatcher] = useState<string>();
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState("");
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState("");

  const { loadSettings } = useSettings();
  const { saveNetworkRegistry, processEvent } = useApi();
  const { dispatch, state: { currentUser, Service } } = useAppState();
  const { handleDeployRegistry, handleSetDispatcher, handleAddAllowedTokens } = useBepro();

  function isEmpty(value: string) {
    return value.trim() === "";
  }
  
  const hasRegistryAddress = !!registryAddress;
  const needToSetDispatcher = hasRegistryAddress && bountyTokenDispatcher && registryAddress !== bountyTokenDispatcher;

  const isDeployRegistryBtnDisabled = [
    treasury.trim() === "",
    hasRegistryAddress,
    !Service?.active?.isAddress(treasury),
    !!exceedsFeesLimitsError(closeFeePercentage),
    !!exceedsFeesLimitsError(cancelFeePercentage),
    !!exceedsFeesLimitsError(networkCreationFeePercentage),
    erc20.validated !== true,
    bountyToken.validated !== true,
    isEmpty(closeFeePercentage),
    isEmpty(cancelFeePercentage),
    isEmpty(lockAmountForNetworkCreation),
    isEmpty(networkCreationFeePercentage)
  ].some(c => c);

  function exceedsFeesLimitsError(fee) {
    if (+fee < 0 || +fee > 100)
      return t("registry.errors.exceeds-limit");

    return undefined;
  }

  function handleErc20Change(value: string, validated?: boolean) {
    setErc20(previous => ({ ...previous, value, validated }));
  }

  function handleBountyTokenChange(value: string, validated?: boolean) {
    setBountyToken(previous => ({ ...previous, value, validated}));
  }

  function handleShowERC20Modal() {
    setVisibleModal(ModalKeys.ERC20);
  }

  function handleShowBountyTokenModal() {
    setVisibleModal(ModalKeys.BountyToken);
  }

  function handleHideModal() {
    setVisibleModal(undefined);
  }

  function deployRegistryContract() {
    if (isDeployRegistryBtnDisabled || !currentUser?.walletAddress) return;

    setisDeployingRegistry(true);

    handleDeployRegistry( erc20.value,
                          lockAmountForNetworkCreation,
                          treasury,
                          networkCreationFeePercentage,
                          closeFeePercentage,
                          cancelFeePercentage,
                          bountyToken.value )
      .then(tx => {
        const { contractAddress } = tx as TransactionReceipt;
        setRegistry(previous => ({ ...previous, value: contractAddress}));

        Service?.active?.loadRegistry(false, contractAddress);

        return saveNetworkRegistry(currentUser?.walletAddress, contractAddress);
      })
      .then(() => {
        loadSettings(true);
      })
      .then(() => dispatch(toastSuccess(t("registry.success.deploy.content"), t("registry.success.deploy.title"))))
      .catch(error => {
        dispatch(toastError(t("registry.errors.deploy")));
        console.debug("Failed to deploy network registry", error);
      })
      .finally(() => setisDeployingRegistry(false));
  }

  function updateData() {
    const updatedValue = value => ({ ...defaultContractField, value });

    setRegistry(updatedValue(registryAddress));

    Service.active.loadRegistry(true, registryAddress)
      .then(loaded => {
        if (!loaded) throw new Error("Not Loaded");

        setErc20(updatedValue(loaded.token.contractAddress));
        setBountyToken(updatedValue(loaded.bountyToken.contractAddress));

        const getParameterWithoutProxy = param => loaded.callTx(loaded.contract.methods[param]());

        return Promise.all([
          loaded.treasury(),
          loaded.lockAmountForNetworkCreation(),
          loaded.networkCreationFeePercentage(),
          getParameterWithoutProxy("closeFeePercentage"),
          getParameterWithoutProxy("cancelFeePercentage"),
          loaded.bountyToken.dispatcher(),
          loaded.divisor,
          loaded.token.contractAddress,
          loaded.getAllowedTokens()
        ])
      })
      .then(parameters => {
        setTreasury(parameters[0].toString());
        setLockAmountForNetworkCreation(parameters[1].toString());
        setNetworkCreationFeePercentage((+parameters[2] * parameters[6]).toString());
        setCloseFeePercentage(parameters[3].toString());
        setCancelFeePercentage(parameters[4].toString());
        setBountyTokenDispatcher(parameters[5].toString());

        const transactional = !!parameters[8].transactional.find(address => parameters[7] = address);
        const reward = !!parameters[8].reward.find(address => parameters[7] = address);

        setIsErc20Allowed({ transactional, reward });
      })
      .catch(console.debug);
  }

  function setDispatcher() {
    setIsSettingDisptacher(true);

    handleSetDispatcher(bountyToken.value, registryAddress)
      .then(() => updateData())
      .then(() => dispatch(toastSuccess(t("registry.success.dispatcher-setted"))))
      .catch(error => {
        dispatch(toastError(t("registry.errors.dispatcher")));
        console.debug("Failed to set dispatcher", error);
      })
      .finally(() => setIsSettingDisptacher(false));
  }

  function allowToken(isTransactional: boolean) {
    handleAddAllowedTokens([erc20.value], isTransactional)
      .then(txInfo => Promise.all([
        updateData(),
        processEvent("registry", "changed", "", { fromBlock: (txInfo as { blockNumber: number }).blockNumber })
      ]))
      .then(() => dispatch(toastSuccess(t("registry.success.allow"))))
      .catch(error => {
        dispatch(toastError(t("registry.errors.allow")));
        console.debug("Failed to allow token", error);
      })
      .finally(() => setIsAllowingToken(undefined));
  }

  function allowAsTransactional() {
    setIsAllowingToken("transactional");
    allowToken(true);
  }

  function allowAsReward() {
    setIsAllowingToken("reward");
    allowToken(false);
  }

  useEffect(() => {
    if (!registryAddress || !Service?.active || !isVisible) return;

    updateData();
  }, [registryAddress, Service?.active]);

  useEffect(() => {
    if (currentUser?.walletAddress) setTreasury(currentUser?.walletAddress);
  }, [currentUser?.walletAddress]);

  return(
    <div className="content-wrapper border-top-0 px-3 py-3">
      { hasRegistryAddress &&
        <ContextualSpan
          context="info"
          className="mb-3"
          isAlert
        >
          {t("registry.errors.already-saved")}
        </ContextualSpan>
      }

      { needToSetDispatcher &&
        <CallToAction
          call={t("registry.cta.dispatcher.call")}
          action={t("registry.cta.dispatcher.action")}
          onClick={setDispatcher}
          color="warning"
          disabled={!needToSetDispatcher}
          executing={isSettingDispatcher}
        />
      }

      { isErc20Allowed?.transactional === false &&
        <CallToAction
          call={t("registry.cta.allow-transactional.call")}
          action={t("registry.cta.allow-transactional.action")}
          onClick={allowAsTransactional}
          color="info"
          disabled={!!isErc20Allowed?.transactional || !!isAllowingToken}
          executing={isAllowingToken === "transactional"}
        />
      }

      { isErc20Allowed?.reward === false &&
        <CallToAction
          call={t("registry.cta.allow-reward.call")}
          action={t("registry.cta.allow-reward.action")}
          onClick={allowAsReward}
          color="info"
          disabled={!!isErc20Allowed?.reward || !!isAllowingToken}
          executing={isAllowingToken === "reward"}
        />
      }

      <Row className="align-items-center mb-3">
        <ContractInput
          field={registry}
          contractName="Network Registry"
          docsLink="https://sdk.dappkit.dev/classes/Network_Registry.html"
          readOnly
        />
      </Row>

      <Row className="align-items-center mb-3">
        <ContractInput
          field={erc20}
          onChange={setErc20}
          contractName={t("registry.fields.governance-token.label")}
          validator="isERC20"
          docsLink="https://sdk.dappkit.dev/classes/ERC20.html"
          readOnly={hasRegistryAddress}
          action={{
            disabled: hasRegistryAddress,
            label: t("registry.actions.deploy-erc20"),
            executing: false,
            onClick: handleShowERC20Modal
          }}
        />
      </Row>

      <Row className="align-items-center mb-3">
        <ContractInput
          field={bountyToken}
          onChange={setBountyToken}
          contractName={t("registry.fields.nft-token.label")}
          validator="isBountyToken"
          docsLink="https://sdk.dappkit.dev/classes/BountyToken.html"
          readOnly={hasRegistryAddress}
          action={{
            disabled: hasRegistryAddress,
            label: t("registry.actions.deploy-bounty-token"),
            executing: false,
            onClick: handleShowBountyTokenModal
          }}
        />
      </Row>

      <Row className="mb-3">
        <FormGroup
          label={t("registry.fields.treasury.label")}
          placeholder={t("registry.fields.treasury.placeholder")}
          description={t("registry.fields.treasury.description")}
          readOnly={hasRegistryAddress}
          value={treasury}
          onChange={setTreasury}
        />
      </Row>

      <Row className="mb-3">
        <FormGroup
          label={t("registry.fields.network-creation-amount.label")}
          placeholder="0"
          value={lockAmountForNetworkCreation}
          onChange={setLockAmountForNetworkCreation}
          variant="numberFormat"
          description={t("registry.fields.network-creation-amount.description")}
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label={t("registry.fields.network-creation-fee.label")}
          placeholder="0"
          value={networkCreationFeePercentage}
          onChange={setNetworkCreationFeePercentage}
          variant="numberFormat"
          description={t("registry.fields.network-creation-fee.description")}
          error={exceedsFeesLimitsError(networkCreationFeePercentage)}
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label={t("registry.fields.close-bounty-fee.label")}
          placeholder="0"
          value={closeFeePercentage}
          onChange={setCloseFeePercentage}
          variant="numberFormat"
          description={t("registry.fields.close-bounty-fee.description")}
          error={exceedsFeesLimitsError(closeFeePercentage)}
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label={t("registry.fields.cancel-bounty-fee.label")}
          placeholder="0"
          value={cancelFeePercentage}
          onChange={setCancelFeePercentage}
          variant="numberFormat"
          description={t("registry.fields.cancel-bounty-fee.description")}
          error={exceedsFeesLimitsError(cancelFeePercentage)}
          readOnly={hasRegistryAddress}
        />
      </Row>

      <Row className="mb-2">
        <Col xs="auto">
          <Button
            disabled={isDeployRegistryBtnDisabled || isDeployingRegistry}
            withLockIcon={isDeployRegistryBtnDisabled}
            isLoading={isDeployingRegistry}
            onClick={deployRegistryContract}
          >
            <span>{t("setup:registry.actions.deploy-registry")}</span>
          </Button>
        </Col>
      </Row>

      <DeployERC20Modal
        show={visibleModal === ModalKeys.ERC20}
        handleHide={handleHideModal}
        onChange={handleErc20Change}
      />

      <DeployBountyTokenModal
        show={visibleModal === ModalKeys.BountyToken}
        handleHide={handleHideModal}
        onChange={handleBountyTokenChange}
      />
    </div>
  );
}