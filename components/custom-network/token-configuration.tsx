import { useEffect, useRef, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import DeployERC20Modal from "components/deploy-erc20-modal";
import { Divider } from "components/divider";
import MultipleTokensDropdown from "components/multiple-tokens-dropdown";
import Step from "components/step";
import TabbedNavigation from "components/tabbed-navigation";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetworkSettings } from "contexts/network-settings";
import { useSettings } from "contexts/settings";

import { handleAllowedTokensDatabase } from "helpers/handleAllowedTokens";

import { StepWrapperProps } from "interfaces/stepper";
import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";

import { ERC20Details } from "./erc20-details";
import { NetworkTokenConfig } from "./network-token-config";

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
  const [networkToken, setNetworkToken] = useState<Token>(undefined);
  const [showModalDeploy, setShowModalDeploy] = useState(false);
  const [allowedTransactionalTokens, setAllowedTransactionalTokens] = useState<Token[]>();
  const [allowedRewardTokens, setAllowedRewardTokens] = useState<Token[]>([]);
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>([]);
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] =
    useState<Token[]>();

  const debounce = useRef(null);

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
  }

  async function validateNetworkAddress(address) {
    setNetworkTokenError(false);
    if (address?.trim() === "" || !DAOService) return undefined;

    try {
      await DAOService.getERC20TokenData(address)
      .then(setNetworkToken)
    } catch(error) {
      setNetworkTokenError(true);
      setNetworkToken({ address: "", name: "", symbol: ""})
      return false;
    }

    return true;
  }

  // LoadData from context
  useEffect(() => {
    if (!DAOService) return;
    if(!networkTokenAddress.length && tokens?.settler)
      setNetworkTokenAddress(tokens.settler);

    if(!selectedRewardTokens?.length && tokens?.allowedRewards)
      setSelectedRewardTokens(tokens.allowedRewards);

    if(!selectedTransactionalTokens?.length && tokens?.allowedTransactions)
      setSelectedTransactionalTokens(tokens.allowedTransactions);
  }, [DAOService, tokens?.settler]);
 

  useEffect(() => {
    if(networkTokenAddress.length >= 16){
      clearTimeout(debounce.current)
      debounce.current = setTimeout(async() => {
        if(await validateNetworkAddress(networkTokenAddress) && tokens?.settler !== networkTokenAddress)
          fields.settlerToken.setter(networkTokenAddress);
      }, 500)
    }
  },[networkTokenAddress])

  useEffect(() => {
    if(selectedRewardTokens?.length)
      fields.allowedRewards.setter(selectedRewardTokens)
  }, [selectedRewardTokens])

  useEffect(() => {
    if(selectedTransactionalTokens?.length)
      fields.allowedTransactions.setter(selectedTransactionalTokens)
  }, [selectedTransactionalTokens])

  useEffect(() => {
    if(!wallet?.address || !DAOService) return
    
    DAOService.getAllowedTokens()
      .then((allowedTokens) => {
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
    if(tokens?.length === 0) return [settings?.beproToken];
    
    return tokens;
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
      <NetworkTokenConfig
        onChange={fields.settlerToken.setter}
        networkTokenAddress={tokens?.settler}
        beproTokenAddress={settings?.beproToken?.address}
      />

      <Divider />

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

      <DeployERC20Modal 
        show={showModalDeploy}
        setClose={handleCloseModal}
        setERC20Address={setNetworkTokenAddress}
      />
    </Step>
  );
}
