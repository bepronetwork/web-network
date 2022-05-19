import { useEffect, useState } from "react";
 /* eslint-disable */
import { FormCheck, ListGroup } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import Button from "components/button";
import DeployNFTModal from "components/deploy-nft-modal";
import Step from "components/step";
import TokensDropdown from "components/tokens-dropdown";

import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { BEPRO_TOKEN, Token } from "interfaces/token";

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

  function handleCheck(e) {
    setAllowCustomTransactionalTokens(e.target.checked);
  }

  function handleNFTTokenChange(e) {
    changedDataHandler("tokens", { label: "nftToken", value: { address: e.target.value, error: false } });
  }

  function handleNetworkTokenChange(token: Token) {
    changedDataHandler("tokens", { label: "networkToken", value: token.address });
  }

  function setDeployedAddress(address) {
    changedDataHandler("tokens", { label: "nftToken", value: { address, error: false } });
  }

  async function validateNFTAddress() {
    if (data.nftToken.address.trim() === "" || !DAOService) return false;

    try {
      DAOService.loadBountyToken(data.nftToken.address);
    } catch(error) {
      changedDataHandler("tokens", { label: "nftToken", value: { ...data.nftToken, error: true } });

      return false;
    }

    return true;
  }

  useEffect(() => {
    if (!DAOService) return;
    if (data.networkToken.trim() === "") return setNetworkToken(undefined);

    DAOService.getERC20TokenData(data.networkToken).then(setNetworkToken).catch(console.log);
  }, [data.networkToken, DAOService]);

  useEffect(() => {
    if (!DAOService) return;
    if (data.networkToken.trim() === "" || data.nftToken.address.trim() === "") 
      return changedDataHandler("tokens", { label: "validated", value: false });

    DAOService.getERC20TokenData(data.networkToken).then(data => {
      setNetworkToken(data);

      return validateNFTAddress();
    })
    .then(validated => {
      changedDataHandler("tokens", { label: "validated", value: validated });
    })
    .catch(console.log);
  }, [data.networkToken, data.nftToken, DAOService]);

 /* eslint-enable */
 
  return (
    <Step
      title={t("custom-network:steps.token-configuration.title")}
      index={step}
      activeStep={currentStep}
      validated={data.validated}
      handleClick={handleChangeStep}
      finishLabel={t("custom-network:steps.repositories.submit-label")}
      handleFinish={handleFinish}
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
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.nft-token.label")}
          </label>

          <input 
            type="text" 
            className="form-control" 
            value={data.nftToken.address} 
            onChange={handleNFTTokenChange}
            onBlur={validateNFTAddress}
          />

          {
            data.nftToken.error && 
            <small className="small-info text-danger">
              {t("custom-network:steps.token-configuration.fields.nft-token.error.pre")}

              <a href="https://sdk.dappkit.dev/classes/BountyToken.html" target="_blank">
                {t("custom-network:steps.token-configuration.fields.nft-token.error.mid")}
              </a>
              
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

      <DeployNFTModal 
        show={showModalDeploy}
        setClose={handleCloseModal}
        setNFTAddress={setDeployedAddress}
      />
    </Step>
  );
}
