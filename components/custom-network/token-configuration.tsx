import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import Button from "components/button";
import DeployNFTModal from "components/deploy-nft-modal";
import Step from "components/step";
import TokensDropdown from "components/tokens-dropdown";

import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";

import { BEPRO_TOKEN, Token } from "interfaces/token";

const { publicRuntimeConfig } = getConfig();

export default function TokenConfiguration({
    step,
    currentStep,
    handleChangeStep
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [bountyTokenAddress, setBountyTokenAddress] = useState("");
  const [bountyTokenUri, setBountyTokenUri] = useState("");
  const [bountyTokenUriError, setBountyTokenUriError] = useState(false);
  const [bountyTokenError, setBountyTokenError] = useState(false);
  const [networkToken, setNetworkToken] = useState<Token>();
  const [showModalDeploy, setShowModalDeploy] = useState(false);
  const [customTokens, setCustomTokens] = useState<Token[]>([BEPRO_TOKEN]);

  const { activeNetwork } = useNetwork();
  const { tokens, fields } = useNetworkSettings();
  const { service: DAOService } = useDAO();

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

  function handleNFTTokenChange(e) {
    setBountyTokenAddress(e.target.value);
    setBountyTokenError(false);
  }

  function handleNFTTokenURIChange(e) {
    setBountyTokenUri(e.target.value);
    setBountyTokenUriError(false);
  }

  function handleNetworkTokenChange(token: Token) {
    fields.settlerToken.setter(token.address);
  }

  function setDeployedAddress(address) {
    setBountyTokenAddress(address);
    fields.bountyToken.setter(bountyTokenAddress);
  }

  function validateTokenUri() {
    setBountyTokenUriError(bountyTokenUri.trim() === "");
    fields.bountyURI.setter(bountyTokenUri);
  }

  async function validateNFTAddress() {
    if (bountyTokenAddress.trim() === "") fields.bountyToken.setter(bountyTokenAddress);
    if (bountyTokenAddress.trim() === "" || !DAOService) return undefined;

    try {
      await DAOService.loadBountyToken(bountyTokenAddress);
      fields.bountyToken.setter(bountyTokenAddress);
      setBountyTokenError(false);
    } catch(error) {
      setBountyTokenError(true);

      return false;
    }

    return true;
  }

  useEffect(() => {
    if (!DAOService) return;
    if (tokens?.settler?.trim() === "") return setNetworkToken(undefined);

    DAOService.getERC20TokenData(tokens?.settler).then(setNetworkToken).catch(console.log);
  }, [tokens?.settler, DAOService]);

  useEffect(() => {
    if (!DAOService) return;

    if (tokens?.settler !== "")
      DAOService.getERC20TokenData(tokens?.settler)
        .then(setNetworkToken)
        .catch(console.log);
    
    validateNFTAddress();
  }, [tokens?.settler, tokens?.bounty, DAOService]);
 
  return (
    <Step
      title={t("custom-network:steps.token-configuration.title")}
      index={step}
      activeStep={currentStep}
      validated={tokens.validated}
      handleClick={handleChangeStep}
    >
      <div className="row">
        <TokensDropdown 
          label={t("custom-network:steps.token-configuration.fields.tokens-dropdown.label")}
          description={t("custom-network:steps.token-configuration.fields.tokens-dropdown.description")}
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
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.name.label")}
          </label>
          <input type="text" className="form-control" value={networkToken?.name}  readOnly />
        </div>

        <div className="form-group col-3">
          <label className="caption-small mb-2">
          {t("custom-network:steps.token-configuration.fields.symbol.label")}
          </label>
          <input type="text" className="form-control" value={networkToken?.symbol}  readOnly />
        </div>

        <div className="form-group col-6">
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.address.label")}
          </label>
          <input type="text" className="form-control" value={networkToken?.address}  readOnly />
        </div>
      </div>

      <div className="row align-items-center">
        <div className="form-group col-9">
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.nft-token.label")}
          </label>

          <input 
            type="text" 
            className="form-control" 
            value={bountyTokenAddress}
            onChange={handleNFTTokenChange}
            onBlur={validateNFTAddress}
          />

          {
            bountyTokenError && 
            <small className="small-info text-danger">
              {t("custom-network:steps.token-configuration.fields.nft-token.error.pre")}
              {" "}
              <a href="https://sdk.dappkit.dev/classes/BountyToken.html" target="_blank">
                {t("custom-network:steps.token-configuration.fields.nft-token.error.mid")}
              </a>
              {" "}
              {t("custom-network:steps.token-configuration.fields.nft-token.error.post")}
            </small>
          }
        </div>

        <div className="col-3 pt-2">
          <Button onClick={handleShowModal}>
            {t("custom-network:steps.token-configuration.actions.deploy-nft-token")}
          </Button>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="form-group col-12">
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.nft-token-uri.label")}
          </label>

          <input 
            type="text" 
            className="form-control" 
            value={bountyTokenUri}
            onChange={handleNFTTokenURIChange}
            onBlur={validateTokenUri}
          />

          {
            bountyTokenUriError && 
            <small className="small-info text-danger">
              {t("custom-network:steps.token-configuration.fields.nft-token-uri.error")}
            </small>
          }
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
