import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import { useNetworkSettings } from "contexts/network-settings";

import {handleAllowedTokensDatabase} from "helpers/handleAllowedTokens";

import {Token} from "interfaces/token";
import {TokenType} from 'interfaces/token'

import useApi from "x-hooks/use-api";

import {useAppState} from "../../../contexts/app-state";
import Button from "../../button";
import MultipleTokensDropdown from "../../multiple-tokens-dropdown";
import {WarningSpan} from "../../warning-span";

interface SelectedTokens {
   [tokenType: TokenType | string]: string[]
}

export default function TokensSettings({
  isGovernorRegistry = false,
  defaultSelectedTokens
}: {
  isGovernorRegistry?: boolean;
  defaultSelectedTokens?: Token[];
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const {state} = useAppState();

  const [currentAllowedTokens, setCurrentAllowedTokens] = useState<SelectedTokens>();
  const [allowedRewardTokensList, setAllowedRewardTokensList] = useState<Token[]>();

  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>();

  const [transansactionLoading, setTransansactionLoading] = useState<boolean>(false);
  const [allowedTransactionalTokensList, setAllowedTransactionalTokensList] = useState<Token[]>();

  const [selectedTransactionalTokens, setSelectedTransactionalTokens] = useState<Token[]>();

  const { getTokens, processEvent } = useApi();

  const {
    fields
  } = useNetworkSettings();

  async function getAllowedTokensContract() {
    state.Service?.active.getAllowedTokens().then(async (tokens) => {
      setCurrentAllowedTokens({
        "transactional": tokens["transactional"] || [],
        "reward": tokens["reward"] || [],
      } as SelectedTokens);

      if(!isGovernorRegistry){
        const current = handleAllowedTokensDatabase(tokens, await getTokens())
        setAllowedTransactionalTokensList(current.transactional);
        setAllowedRewardTokensList(current.reward);
      } else {
        await Promise.all([
          Promise.all(tokens?.transactional?.map((address) => state.Service?.active.getERC20TokenData(address))),
          Promise.all(tokens?.reward?.map((address) => state.Service?.active.getERC20TokenData(address))),
          getTokens(),
        ]).then(([transactionals, reward])=> {
          setAllowedTransactionalTokensList(transactionals);
          setSelectedTransactionalTokens(transactionals);

          setAllowedRewardTokensList(reward)
          setSelectedRewardTokens(reward)
  
        }).catch(console.error)
        .finally(() => {
          setTransansactionLoading(false);
        })
      }
     
    });
  }

  function addRewardToken(newToken: Token) {
    setAllowedRewardTokensList((oldState) => [...(oldState||[]), newToken]);
  }

  function addTransactionalToken(newToken: Token) {
    setAllowedTransactionalTokensList((oldState) =>  [...(oldState || []), newToken]);
  }

  async function updateTransactionalTokens(tokenType: TokenType){
    const isTransactional = tokenType === 'transactional';
    const currentTokens = currentAllowedTokens[tokenType]

    const selectedTokens = isTransactional ? selectedTransactionalTokens : selectedRewardTokens;
    if(!currentTokens || !selectedTokens) return
    const selectedTokensAddress = selectedTokens.map(({address})=> address)
    
    const toAdd = selectedTokensAddress.filter((address)=> !currentTokens.includes(address))

    const toRemove = currentTokens.filter((address)=> !selectedTokensAddress.includes(address))

    const transactions = []

    if(toAdd.length) transactions.push(state.Service?.active.addAllowedTokens(toAdd, isTransactional))
    if(toRemove.length) transactions.push(state.Service?.active.removeAllowedTokens(toRemove, isTransactional))

    Promise.all(transactions).then(([txAdd, txRemove])=>{
      const blockAdd = (txAdd as { blockNumber: number })?.blockNumber 
      
      if(!blockAdd) return;
      
      const blockRemove = (txRemove as { blockNumber: number })?.blockNumber 
      const fromBlock = isNaN(blockRemove) ? blockAdd : Math.min(blockAdd, blockRemove);
      
      processEvent("registry", "changed", state.Service?.network?.active.name, {
                fromBlock
      })
      getAllowedTokensContract();
    })
  }


  useEffect(() => {
    if (!state.Service?.active) return;

    getAllowedTokensContract();
      
  }, [isGovernorRegistry]);

  useEffect(() => {
    if (defaultSelectedTokens?.length > 0) {
      setSelectedTransactionalTokens(defaultSelectedTokens?.filter((token) => token.isTransactional));
      setSelectedRewardTokens(defaultSelectedTokens?.filter((token) => !token.isTransactional));
    }
  }, [defaultSelectedTokens]);

  useEffect(() => {
    fields.allowedTransactions.setter(selectedTransactionalTokens);
    fields.allowedRewards.setter(selectedRewardTokens)
  }, [selectedRewardTokens, selectedTransactionalTokens]);


  function renderButtons(tokenType: TokenType) {
    return (
      <div className="d-flex" key={`col-${tokenType}`}>
        <Button className="mb-2" onClick={()=> updateTransactionalTokens(tokenType)}>
          <span>
          {tokenType === 'transactional'
              ? t("custom-network:save-transactional-config")
              : t("custom-network:save-reward-config")}
          </span>
        </Button>
      </div>
    );
  }
  

  function handleSelectTokens(type: TokenType) {
    const tokenData = {
      transactional: {
        key: "select-multi-transactional",
        label: t("select-multiple.allowed-transactional-tokens"),
        description: t("select-multiple.add-transactional-tokens"),
        addToken: addTransactionalToken,
        tokens: allowedTransactionalTokensList,
        canAddToken: isGovernorRegistry,
        selectedTokens: selectedTransactionalTokens,
        changeSelectedTokens: setSelectedTransactionalTokens,
        isloading: transansactionLoading
      },
      reward: {
        key: "select-multi-reward",
        label: t("select-multiple.allowed-reward-tokens"),
        description: t("select-multiple.add-reward-tokens"),
        addToken: addRewardToken,
        tokens: allowedRewardTokensList,
        canAddToken: isGovernorRegistry,
        selectedTokens: selectedRewardTokens,
        changeSelectedTokens: setSelectedRewardTokens
      }
    }

    return (
      <MultipleTokensDropdown {...tokenData[type]}/>
    )
  }

  function renderTokens(type: TokenType) {
    const col = isGovernorRegistry ? 7 : 12
    
    return(
      <>
        <Col xs={col} key={`col-${type}`}>{handleSelectTokens(type)}</Col>
        {isGovernorRegistry && (
          <Col xs={4} className="mt-4 pt-1">
            {renderButtons(type)}
          </Col>
        )}
      </>
    )
  } 
  
  return (
    <>
      <Row className="mt-1">
        <span className="caption-medium text-white mb-3">
          {isGovernorRegistry
            ? t("custom-network:config-tokens-registry")
            : t("custom-network:config-tokens")}
        </span>
        {renderTokens("transactional")}
      </Row>
      {isGovernorRegistry && (
        <div className="mb-3">
          <WarningSpan
            text={t("custom-network:steps.network-settings.fields.other-settings.warning-add-remove-allowed-tokens")}
          />
        </div>
      )}
      <Row className="mb-2">
        {renderTokens("reward")}
      </Row>
    </>
  );
}
