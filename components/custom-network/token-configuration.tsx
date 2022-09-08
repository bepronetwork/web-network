import { useEffect, useRef, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import DeployERC20Modal from "components/deploy-erc20-modal";
import MultipleTokensDropdown from "components/multiple-tokens-dropdown";
import Step from "components/step";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetworkSettings } from "contexts/network-settings";
import { useSettings } from "contexts/settings";

import { handleAllowedTokensDatabase } from "helpers/handleAllowedTokens";

import { StepWrapperProps } from "interfaces/stepper";
import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";

export default function TokenConfiguration({ 
  activeStep, 
  index, 
  validated, 
  handleClick, 
  finishLabel, 
  handleFinish
} : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);
  
  const { wallet } = useAuthentication();
  const [networkTokenAddress, setNetworkTokenAddress] = useState("");
  const [networkTokenError, setNetworkTokenError] = useState(false);
  const [networkToken, setNetworkToken] = useState<Token>();
  const [showModalDeploy, setShowModalDeploy] = useState(false);
  const [allowedTransactionalTokens, setAllowedTransactionalTokens] = useState<Token[]>();
  const [allowedRewardTokens, setAllowedRewardTokens] = useState<Token[]>();
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>();
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] =
    useState<Token[]>();

  const { tokens, fields } = useNetworkSettings();
  const { service: DAOService } = useDAO();
  const { getTokens } = useApi();
  const { settings } = useSettings();

  function handleShowModal() {
    setShowModalDeploy(true);
  }

  function handleCloseModal() {
    setShowModalDeploy(false);
  }

  function addTransactionalToken(newToken: Token) {
    setAllowedTransactionalTokens([
      ...allowedTransactionalTokens,
      newToken
    ]);
  }

  function addRewardToken(newToken: Token) {
    setAllowedRewardTokens([
      ...allowedRewardTokens,
      newToken
    ]);
  }

  function changeSelectedTransactionalTokens(newToken: Token[]) {
    setSelectedTransactionalTokens(newToken);
  }

  function changeSelectedRewardTokens(newToken: Token[]) {
    setSelectedRewardTokens(newToken);
  }

  function handleNetworkTokenChange(e) {
    setNetworkTokenAddress(e.target.value)
    setNetworkToken({ address: "", name: "", symbol: ""})
    setNetworkTokenError(false);
  }

  function setDeployedAddress(address) {
    setNetworkTokenAddress(address);
    fields.settlerToken.setter(address);
  }

  async function validateNetworkAddress() {
    if (networkTokenAddress.trim() === "") fields.settlerToken.setter(networkTokenAddress);
    if (networkTokenAddress.trim() === "" || !DAOService) return undefined;

    try {
      await DAOService.getERC20TokenData(networkTokenAddress).then(setNetworkToken)
      fields.settlerToken.setter(networkTokenAddress);
      setNetworkTokenError(false);
    } catch(error) {
      setNetworkTokenError(true);
      setNetworkToken({ address: "", name: "", symbol: ""})
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
    
    validateNetworkAddress();
  }, [tokens?.settler, DAOService]);
 
  useEffect(() => {
    if(networkTokenAddress.length < 18) validateNetworkAddress()
  },[networkTokenAddress])

  useEffect(() => {
    fields.allowedRewards.setter(selectedRewardTokens)
  }, [selectedRewardTokens])

  useEffect(() => {
    fields.allowedTransactions.setter(selectedTransactionalTokens)
  }, [selectedTransactionalTokens])

  useEffect(() => {
    if(!wallet?.address || !DAOService) return
    
    DAOService.getAllowedTokens().then((allowedTokens) => {
      getTokens()
        .then((tokens) => {
          const { transactional, reward } = handleAllowedTokensDatabase(allowedTokens, tokens)
          setAllowedTransactionalTokens(transactional);
          setAllowedRewardTokens(reward);
        })
        .catch((err) => console.log("error to get tokens database ->", err));
    }).catch((err) => console.log("error to get allowed tokens contract ->", err));
  }, [wallet?.address])
  
  function handleEmptyTokens (tokens: Token[]) {
    if(tokens?.length === 0) return [settings?.beproToken]

    return tokens
  }

  return (
    <Step
      title={t("custom-network:steps.token-configuration.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
      handleFinish={handleFinish}
      finishLabel={finishLabel}
    >
      <div className="row align-items-center">
        <div className="form-group col-9">
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.tokens-dropdown.label")}
          </label>

          <input 
            ref={tokenAddressInputRef}
            type="text" 
            className="form-control" 
            value={networkTokenAddress}
            onChange={handleNetworkTokenChange}
            onBlur={validateNetworkAddress}
          />

          {
            networkTokenError && 
            <small className="small-info text-danger">
              {t("custom-network:steps.token-configuration.fields.nft-token.error.pre")}
              {" "}
              <a href="https://sdk.dappkit.dev/classes/ERC20.html" target="_blank">
                {t("misc.token")}
              </a>
              {" "}
              {t("custom-network:steps.token-configuration.fields.nft-token.error.post")}
            </small>
          }
        </div>

        <div className="col-3 pt-2">
          <Button onClick={handleShowModal}>
            {t("custom-network:steps.token-configuration.actions.deploy-new-token")}
          </Button>
        </div>
      </div>

      <div className="row">
        <div className="form-group col-6">
          <label className="caption-small mb-2">
            {t("custom-network:steps.token-configuration.fields.name.label")}
          </label>
          <input type="text" className="form-control" value={networkToken?.name}  readOnly />
        </div>

        <div className="form-group col-6">
          <label className="caption-small mb-2">
          {t("custom-network:steps.token-configuration.fields.symbol.label")}
          </label>
          <input type="text" className="form-control" value={networkToken?.symbol}  readOnly />
        </div>
      </div>

      <div className="row">
          <>
            <MultipleTokensDropdown
              label={t("select-multiple.allowed-transactional-tokens")}
              description={t("select-multiple.add-transactional-tokens")}
              addToken={addTransactionalToken}
              tokens={handleEmptyTokens(allowedTransactionalTokens)}
              canAddToken={false}
              selectedTokens={selectedTransactionalTokens}
              changeSelectedTokens={changeSelectedTransactionalTokens}
            />

            <MultipleTokensDropdown
              label={t("select-multiple.allowed-reward-tokens")}
              description={t("select-multiple.add-reward-tokens")}
              addToken={addRewardToken}
              tokens={handleEmptyTokens(allowedRewardTokens)}
              canAddToken={false}
              selectedTokens={selectedRewardTokens}
              changeSelectedTokens={changeSelectedRewardTokens}
            />
          </>
      </div>

      <DeployERC20Modal 
        show={showModalDeploy}
        setClose={handleCloseModal}
        setERC20Address={setDeployedAddress}
      />
    </Step>
  );
}
