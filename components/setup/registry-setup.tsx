import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";

import Button from "components/button";
import { ContextualSpan } from "components/contextual-span";
import { FormGroup } from "components/form-group";
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
  const [treasury, setTreasury] = useState("");
  const [erc20, setErc20] = useState(defaultContractField);
  const [visibleModal, setVisibleModal] = useState<string>();
  const [registry, setRegistry] = useState(defaultContractField);
  const [closeFeePercentage, setCloseFeePercentage] = useState("");
  const [cancelFeePercentage, setCancelFeePercentage] = useState("");
  const [bountyToken, setBountyToken] = useState(defaultContractField);
  const [isDeployingRegistry, setisDeployingRegistry] = useState(false);
  const [isSettingDispatcher, setIsSettingDisptacher] = useState(false);
  const [bountyTokenDispatcher, setBountyTokenDispatcher] = useState<string>();
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState("");
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState("");

  const { loadSettings } = useSettings();
  const { saveNetworkRegistry } = useApi();
  const { handleDeployRegistry, handleSetDispatcher } = useBepro();
  const { dispatch, state: { currentUser, Service } } = useAppState();

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
      return "Value must be between 0 and 100";

    return undefined;
  }

  function handleErc20Change(value: string) {
    setErc20(previous => ({ ...previous, value}));
  }

  function handleBountyTokenChange(value: string) {
    setBountyToken(previous => ({ ...previous, value}));
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

        return saveNetworkRegistry(currentUser?.walletAddress, contractAddress);
      })
      .then(() => loadSettings(true))
      .then(() => dispatch(toastSuccess("See the Network Registry field", "Registry deployed")))
      .catch(error => {
        dispatch(toastError("Failed to deploy Network Registry"));
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
          loaded.divisor
        ])
      })
      .then(parameters => {
        setTreasury(parameters[0].toString());
        setLockAmountForNetworkCreation(parameters[1].toString());
        setNetworkCreationFeePercentage((+parameters[2] * parameters[6]).toString());
        setCloseFeePercentage(parameters[3].toString());
        setCancelFeePercentage(parameters[4].toString());
        setBountyTokenDispatcher(parameters[5].toString());
      })
      .catch(console.debug);
  }

  function setDispatcher() {
    setIsSettingDisptacher(true);

    handleSetDispatcher(bountyToken.value, registryAddress)
      .then(() => updateData())
      .then(() => dispatch(toastSuccess("Dispatcher setted")))
      .catch(error => {
        dispatch(toastError("Failed to set dispatcher"));
        console.debug("Failed to set dispatcher", error);
      })
      .finally(() => setIsSettingDisptacher(false));
  }

  useEffect(() => {
    if (!registryAddress || !Service?.active || !isVisible) return;

    updateData();
  }, [registryAddress, Service?.active]);

  return(
    <div className="content-wrapper border-top-0 px-3 py-3">
      { hasRegistryAddress &&
        <ContextualSpan
          context="info"
          className="mb-3"
          isAlert
        >
          Network Registry already saved
        </ContextualSpan>
      }

      { needToSetDispatcher &&
        <ContextualSpan
          context="warning"
          className="mb-3"
          isAlert
        >
          <span className="col">The Bounty Token requires Network Registry to be set as dispatcher</span>
          <Button
            color="warning"
            disabled={isSettingDispatcher || !needToSetDispatcher}
            withLockIcon={!needToSetDispatcher}
            isLoading={isSettingDispatcher}
            onClick={setDispatcher}
          >
            Set Dispatcher
          </Button>
        </ContextualSpan>
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
          contractName="ERC20"
          validator="isERC20"
          docsLink="https://sdk.dappkit.dev/classes/ERC20.html"
          readOnly={hasRegistryAddress}
          action={{
            disabled: hasRegistryAddress,
            label: "Deploy New ERC20 Token",
            executing: false,
            onClick: handleShowERC20Modal
          }}
        />
      </Row>

      <Row className="align-items-center mb-3">
        <ContractInput
          field={bountyToken}
          onChange={setBountyToken}
          contractName="Bounty Token"
          validator="isBountyToken"
          docsLink="https://sdk.dappkit.dev/classes/BountyToken.html"
          readOnly={hasRegistryAddress}
          action={{
            disabled: hasRegistryAddress,
            label: "Deploy New Bounty Token",
            executing: false,
            onClick: handleShowBountyTokenModal
          }}
        />
      </Row>

      <Row className="mb-3">
        <FormGroup
          label="Treasury"
          placeholder="Treasury wallet address"
          description="Wallet that will receive the network registry fees"
          readOnly={hasRegistryAddress}
          value={treasury}
          onChange={setTreasury}
        />
      </Row>

      <Row className="mb-3">
        <FormGroup
          label="Network Creation Amount"
          placeholder="0"
          value={lockAmountForNetworkCreation}
          onChange={setLockAmountForNetworkCreation}
          variant="numberFormat"
          description="Amount needed to be locked on registry to register a network"
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label="Network Creation Fee"
          placeholder="0"
          value={networkCreationFeePercentage}
          onChange={setNetworkCreationFeePercentage}
          variant="numberFormat"
          description="Percentage of the network creation amount charged when a network is registered"
          error={exceedsFeesLimitsError(networkCreationFeePercentage)}
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label="Close Bounty Fee"
          placeholder="0"
          value={closeFeePercentage}
          onChange={setCloseFeePercentage}
          variant="numberFormat"
          description="Percentage of the bounty amount charged when a bounty is closed"
          error={exceedsFeesLimitsError(closeFeePercentage)}
          readOnly={hasRegistryAddress}
        />

        <FormGroup
          label="Cancel Bounty Fee"
          placeholder="0"
          value={cancelFeePercentage}
          onChange={setCancelFeePercentage}
          variant="numberFormat"
          description="Percentage of the bounty amount charged when a canceled is closed"
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
            <span>Deploy Network Registry</span>
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