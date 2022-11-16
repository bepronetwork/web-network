import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import ExternalLinkIcon from "assets/icons/external-link-icon";

import Button from "components/button";
import { Divider } from "components/divider";
import { FormGroup } from "components/form-group";
import { DeployBountyTokenModal } from "components/setup/deploy-bounty-token-modal";
import { DeployERC20Modal } from "components/setup/deploy-erc20-modal";

import { useAppState } from "contexts/app-state";

interface RegistrySetupProps { 
  isVisible?: boolean;
  registryAddress: string;
}

interface ContractField {
  value: string;
  validated: boolean;
}

const defaultContractField: ContractField = {
  value: "",
  validated: undefined
};

const ExternalLink = ({ label, href }) => (
  <div className={`d-flex flex-row align-items-center mt-1 gap-2 text-primary`} key={label}>
    <a 
      href={href} 
      className={`text-decoration-none p family-Regular text-primary`} 
      target="_blank"
    >
        {label}
      </a>
    <ExternalLinkIcon width={12} height={12} />
  </div>
);

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
  const [lockAmountForNetworkCreation, setLockAmountForNetworkCreation] = useState("");
  const [networkCreationFeePercentage, setNetworkCreationFeePercentage] = useState("");

  const { state: { Service } } = useAppState();

  if (!isVisible)
    return <></>;

  function isEmpty(value: string) {
    return value.trim() === "";
  }

  const isUseExistingBtnDisabled = registry.value.trim() === "" || !Service?.active?.isAddress(registry.value);

  const isDeployRegistryBtnDisabled = [
    treasury.trim() === "",
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

  function isInvalid(validated, contractName) {
    return validated === false ? `Please provide a valid ${contractName} address` : undefined;
  }
  
  function exceedsFeesLimitsError(fee) {
    if (+fee < 0 || +fee > 100)
      return "Value must be between 0 and 100";

    return undefined;
  }

  function validateContractField(value, setter, validator) {
    if (!Service?.active || value.trim() === "") 
      return setter(previous => ({ ...previous, validated: undefined }));

    if (!Service.active.isAddress(value))
      return setter(previous => ({ ...previous, validated: false }));
    
    Service.active[validator](value)
      .then(loaded => setter(previous => ({ ...previous, validated: !!loaded })));
  }

  function validateNetworkRegistry() {
    validateContractField(registry.value, setRegistry, "isNetworkRegistry");
  }

  function validateERC20() {
    validateContractField(erc20.value, setErc20, "isERC20");
  }

  function validateBountyToken() {
    validateContractField(bountyToken.value, setBountyToken, "isBountyToken");
  }

  function handleRegistryChange(value: string) {
    setRegistry(previous => ({ ...previous, value}));
  }

  function handleErc20Change(value: string) {
    setErc20(previous => ({ ...previous, value}));
  }

  function handleBountyTokenChange(value: string) {
    setBountyToken(previous => ({ ...previous, value}));
  }

  function handleShowERC20Modal() {
    setVisibleModal("erc20");
  }

  function handleShowBountyTokenModal() {
    setVisibleModal("bountyToken");
  }

  function handleHideModal() {
    setVisibleModal(undefined);
  }

  return(
    <div className="content-wrapper border-top-0 px-3 py-3">
      <Row className="align-items-center mb-3">
        <FormGroup
          label="Network Registry"
          placeholder="Registry contract address"
          value={registry.value}
          onChange={handleRegistryChange}
          onBlur={validateNetworkRegistry}
          error={isInvalid(registry.validated, "Network Registry")}
          hint={
            <ExternalLink
              label="View Network Registry docs"
              href="https://sdk.dappkit.dev/classes/Network_Registry.html"
            />
          }
        />

        <Col xs="auto">
          <Button 
            disabled={isUseExistingBtnDisabled} 
            withLockIcon={isUseExistingBtnDisabled}
          >
            <span>Use existing Network Registry</span>
          </Button>
        </Col>
      </Row>

      <Divider />

      <Row className="align-items-center mt-4 mb-3">
        <FormGroup
          label="ERC20 Token"
          placeholder="ERC20 Token Address"
          value={erc20.value}
          onChange={handleErc20Change}
          onBlur={validateERC20}
          error={isInvalid(erc20.validated, "ERC20")}
          hint={
            <ExternalLink
              label="View ERC20 docs"
              href="https://sdk.dappkit.dev/classes/ERC20.html"
            />
          }
        />

        <Col xs="auto">
          <Button
            onClick={handleShowERC20Modal}
          >
            Deploy New ERC20 Token
          </Button>
        </Col>
      </Row>

      <Row className="align-items-center mb-3">
        <FormGroup
          label="Bounty Token"
          placeholder="Bounty Token Address"
          value={bountyToken.value}
          onChange={handleBountyTokenChange}
          onBlur={validateBountyToken}
          error={isInvalid(bountyToken.validated, "Bounty Token")}
          hint={
            <ExternalLink
              label="View BountyToken docs"
              href="https://sdk.dappkit.dev/classes/BountyToken.html"
            />
          }
        />

        <Col xs="auto">
          <Button
            onClick={handleShowBountyTokenModal}
          >
            Deploy New Bounty Token
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <FormGroup
          label="Treasury"
          placeholder="Treasury wallet address"
          description="Wallet that will receive the fees"
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
        />

        <FormGroup
          label="Network Creation Fee"
          placeholder="0"
          value={networkCreationFeePercentage}
          onChange={setNetworkCreationFeePercentage}
          variant="numberFormat"
          description="Percentage of the network creation amount charged when a network is registered"
          error={exceedsFeesLimitsError(networkCreationFeePercentage)}
        />

        <FormGroup
          label="Close Bounty Fee"
          placeholder="0"
          value={closeFeePercentage}
          onChange={setCloseFeePercentage}
          variant="numberFormat"
          description="Percentage of the bounty amount charged when a bounty is closed"
          error={exceedsFeesLimitsError(closeFeePercentage)}
        />

        <FormGroup
          label="Cancel Bounty Fee"
          placeholder="0"
          value={cancelFeePercentage}
          onChange={setCancelFeePercentage}
          variant="numberFormat"
          description="Percentage of the bounty amount charged when a canceled is closed"
          error={exceedsFeesLimitsError(cancelFeePercentage)}
        />
      </Row>

      <Row className="mb-2">
        <Col xs="auto">
          <Button
            disabled={isDeployRegistryBtnDisabled}
            withLockIcon={isDeployRegistryBtnDisabled}
          >
            <span>Deploy Network Registry</span>
          </Button>
        </Col>
      </Row>

      <DeployERC20Modal
        show={visibleModal === "erc20"}
        handleHide={handleHideModal}
        onChange={handleErc20Change}
      />

      <DeployBountyTokenModal
        show={visibleModal === "bountyToken"}
        handleHide={handleHideModal}
        onChange={handleBountyTokenChange}
      />
    </div>
  );
}