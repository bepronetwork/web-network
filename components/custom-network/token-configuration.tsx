import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { Divider } from "components/divider";
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
  
  const [allowedRewardTokens, setAllowedRewardTokens] = useState<Token[]>([]);
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>([]);
  const [allowedTransactionalTokens, setAllowedTransactionalTokens] = useState<Token[]>();
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] = useState<Token[]>();
  
  const { getTokens } = useApi();
  const { settings } = useSettings();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { tokens, fields } = useNetworkSettings();

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

  // LoadData from context
  useEffect(() => {
    if (!DAOService) return;

    if(!selectedRewardTokens?.length && tokens?.allowedRewards)
      setSelectedRewardTokens(tokens.allowedRewards);

    if(!selectedTransactionalTokens?.length && tokens?.allowedTransactions)
      setSelectedTransactionalTokens(tokens.allowedTransactions);
  }, [DAOService, tokens?.settler]);

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
      {console.log(tokens?.settler)}
      <NetworkTokenConfig
        onChange={fields.settlerToken.setter}
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
    </Step>
  );
}
