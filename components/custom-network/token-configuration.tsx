import {useContext, useEffect, useRef, useState} from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { Divider } from "components/divider";
import MultipleTokensDropdown from "components/multiple-tokens-dropdown";
import Step from "components/step";

import { useNetworkSettings } from "contexts/network-settings";

import { handleAllowedTokensDatabase } from "helpers/handleAllowedTokens";

import { StepWrapperProps } from "interfaces/stepper";
import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";

import {AppStateContext, useAppState} from "../../contexts/app-state";

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

  const {state} = useAppState();

  const [networkTokenAddress, setNetworkTokenAddress] = useState("");
  const [networkTokenError, setNetworkTokenError] = useState(false);
  const [networkToken, setNetworkToken] = useState<Token>(undefined);
  const [showModalDeploy, setShowModalDeploy] = useState(false);
  const [allowedTransactionalTokens, setAllowedTransactionalTokens] = useState<Token[]>();
  const [allowedRewardTokens, setAllowedRewardTokens] = useState<Token[]>([]);
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>([]);
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] = useState<Token[]>();
  const [createNetworkAmount, setCreateNetworkAmount] = useState<string>();

  const debounce = useRef(null)

  const { getTokens } = useApi();


  const { tokens, fields, tokensLocked } = useNetworkSettings();
  const networkTokenSymbol = state.Settings?.beproToken?.symbol || t("misc.$token");

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
    if (address?.trim() === "" || !state.Service?.active) return undefined;

    try {
      await state.Service?.active.getERC20TokenData(address)
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
    if (!state.Service?.active) return;
    if(!selectedRewardTokens?.length && tokens?.allowedRewards)
      setSelectedRewardTokens(tokens.allowedRewards);

    if(!selectedTransactionalTokens?.length && tokens?.allowedTransactions)
      setSelectedTransactionalTokens(tokens.allowedTransactions);
  }, [state.Service?.active, tokens?.settler]);

  useEffect(() => {
    fields.allowedRewards.setter(selectedRewardTokens);
  }, [selectedRewardTokens])

  useEffect(() => {
    fields.allowedTransactions.setter(selectedTransactionalTokens);
  }, [selectedTransactionalTokens])

  useEffect(() => {
    if(!state.currentUser?.walletAddress || !state.Service?.active) return
    
    state.Service?.active.getAllowedTokens()
      .then((allowedTokens) => {
        getTokens()
          .then((tokens) => {
            const { transactional, reward } = handleAllowedTokensDatabase(allowedTokens, tokens)
            setAllowedTransactionalTokens(transactional);
            setAllowedRewardTokens(reward);
          })
          .catch((err) => console.log("error to get tokens database ->", err));
      }).catch((err) => console.log("error to get allowed tokens contract ->", err));
  }, [state.currentUser?.walletAddress])

  useEffect(() => {
    if(!state?.currentUser?.walletAddress || !state?.Service?.active || !BigNumber(tokensLocked.needed).gt(0)) return

    state?.Service?.active.getRegistryParameter("networkCreationFeePercentage").then(createFee => {
      setCreateNetworkAmount(BigNumber(BigNumber(createFee).multipliedBy(tokensLocked.needed)).toFixed());
    })

  }, [state?.currentUser?.walletAddress, tokensLocked.needed])
  
  function handleEmptyTokens (tokens: Token[]) {
    if(tokens?.length === 0) return [state.Settings?.beproToken];

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
        beproTokenAddress={state.Settings?.beproToken?.address}
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
     {validated && (
        <>
        <span className="p-small text-warning mb-2">
          {t("custom-network:network-create-warning")}
        </span>
        <span className="p-small text-warning mb-4">
        {t("custom-network:network-amount-to-create", {
              amount: createNetworkAmount,
              symbol: networkTokenSymbol,
              totalAmount: tokensLocked.locked
        })}
        </span>
        </>
      )}
    </Step>
  );
}
