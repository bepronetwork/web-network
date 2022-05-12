import { useEffect, useState } from "react";
import { FormCheck, ListGroup } from "react-bootstrap";

import { BountyToken } from "@taikai/dappkit";
import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import Button from "components/button";
import DeployNFTModal from "components/deploy-nft-modal";
import Step from "components/step";
import TokensDropdown from "components/tokens-dropdown";

import { useNetwork } from "contexts/network";

import { BEPRO_TOKEN, Token } from "interfaces/token";

import { BeproService } from "services/bepro-service";

const { publicRuntimeConfig } = getConfig();

export default function TokenConfiguration({
    data,
    step,
    handleFinish,
    currentStep,
    handleChangeStep,
    changedDataHandler
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [customTokens, setCustomTokens] = useState<Token[]>([BEPRO_TOKEN]);
  const [networkToken, setNetworkToken] = useState<Token>();
  const [allowCustomTransactionalTokens, setAllowCustomTransactionalTokens] = useState("false");
  const [showModalDeploy, setShowModalDeploy] = useState(false);

  const { activeNetwork } = useNetwork();

  function handleShowModal() {
    setShowModalDeploy(true);
  }

  function handleCloseModal() {
    setShowModalDeploy(false);
  }

  function addToken(newToken: Token) {
    setCustomTokens([
      ...customTokens,
      newToken
    ]);
  }

  function handleCheck(e) {
    setAllowCustomTransactionalTokens(e.target.checked);
  }

  function handleNFTTokenChange(e) {
    changedDataHandler("tokens", { label: "nftToken", value: e.target.value });
  }

  function handleNetworkTokenChange(token: Token) {
    changedDataHandler("tokens", { label: "networkToken", value: token.address });
  }

  function setDeployedAddress(address) {
    changedDataHandler("tokens", { label: "nftToken", value: address });
  }

  async function validateNFTAddress() {
    if (data.nftToken.trim() === "") return changedDataHandler("tokens", { label: "validated", value: false });

    const token = new BountyToken(BeproService.bepro, data.nftToken);

    await token.loadContract();

    return true;
  }

  useEffect(() => {
    if (data.networkToken.trim() === "" || data.nftToken.trim() === "") 
      return changedDataHandler("tokens", { label: "validated", value: false });

    BeproService.getERC20TokenData(data.networkToken).then(data => {
      setNetworkToken(data);

      return validateNFTAddress();
    })
    .then(validated => {
      changedDataHandler("tokens", { label: "validated", value: validated });
    })
    .catch(console.log);
  }, [data.networkToken, data.nftToken]);

  return (
    <Step
      title="Token Configuration"
      index={step}
      activeStep={currentStep}
      validated={data.validated}
      handleClick={handleChangeStep}
      finishLabel={t("custom-network:steps.repositories.submit-label")}
      handleFinish={handleFinish}
    >
      <div className="row">
        <TokensDropdown 
          label="Network Token"
          description="Add an ERC20 token to be used as network token." 
          tokens={customTokens} 
          canAddToken={
            activeNetwork?.networkAddress === publicRuntimeConfig?.contract?.address ? 
            publicRuntimeConfig?.networkConfig?.allowCustomTokens :
            !!activeNetwork?.allowCustomTokens
          }
          addToken={addToken} 
          setToken={handleNetworkTokenChange}
        /> 
      </div>

      <div className="row">
        <div className="form-group col-3">
          <label className="caption-small mb-2">Name</label>
          <input type="text" className="form-control" value={networkToken?.name}  readOnly />
        </div>

        <div className="form-group col-3">
          <label className="caption-small mb-2">Symbol</label>
          <input type="text" className="form-control" value={networkToken?.symbol}  readOnly />
        </div>

        <div className="form-group col-6">
          <label className="caption-small mb-2">Address</label>
          <input type="text" className="form-control" value={networkToken?.address}  readOnly />
        </div>
      </div>

      {/* <div className="row">
        <div className="d-flex align-items-center p-small text-white m-0 p-0">
          <FormCheck
            className="form-control-lg pb-0 pr-0 mr-0"
            type="checkbox"
            value={allowCustomTransactionalTokens}
            onChange={handleCheck}
          />
          <span>
            Allow users to use others tokens as Transactional Tokens
          </span>
        </div>
      </div>

      <div className="row">
        <ListGroup>
          <ListGroup.Item>Cras justo odio</ListGroup.Item>
        </ListGroup>
      </div> */}

      <div className="row align-items-center">
        <div className="form-group col-9">
          <label className="caption-small mb-2">NFT Token Address</label>
          <input 
            type="text" 
            className="form-control" 
            value={data.nftToken} 
            onChange={handleNFTTokenChange}
          />
        </div>

        <div className="col-3 pt-2">
          <Button onClick={handleShowModal}>Deploy New NFT Token</Button>
        </div>
      </div>

      <DeployNFTModal 
        show={showModalDeploy}
        setClose={handleCloseModal}
        setNFTAddress={setDeployedAddress}
      />
    </Step>
  );
}
