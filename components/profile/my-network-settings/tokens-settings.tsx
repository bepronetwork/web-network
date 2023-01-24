import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import { useNetworkSettings } from "contexts/network-settings";

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

  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>();
  const [allowedRewardTokensList, setAllowedRewardTokensList] = useState<Token[]>();
  const [currentAllowedTokens, setCurrentAllowedTokens] = useState<SelectedTokens>();
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] = useState<Token[]>();
  const [allowedTransactionalTokensList, setAllowedTransactionalTokensList] = useState<Token[]>();

  const { getTokens, processEvent } = useApi();

  const {
    fields
  } = useNetworkSettings();

  const tokenToAddress = ({ address } : Token) => address;
  const tokenNotInSelected = ({ address }: Token,
    selecteds: Token[],
    type: "transactional" | "reward") => {
    const handleConditional = (t: Token) => type === "transactional" ? (t.isTransactional === true) : 
    (t.isReward === true)
    return (!selecteds?.find((f) => f.address === address && handleConditional(f)))
  }
    

  async function getAllowedTokensContract() {
    setIsLoadingTokens(true);

    try {
      const dbTokens = await getTokens();

      const { 
        dbRewardAllowed,
        dbTransactionalAllowed
      } = dbTokens.reduce((previous, current) => {
        const tmp = { ...previous };
        const { isTransactional, isReward, isAllowed } = current;

        if (isTransactional && isAllowed)
          tmp.dbTransactionalAllowed.push(current);
        if (isReward && isAllowed)
          tmp.dbRewardAllowed.push(current);

        return tmp;
      }, { 
        dbRewardAllowed: [], 
        dbTransactionalAllowed: []
      });

      const availableReward = {};
      dbTokens.forEach(dbToken => {
        if (!dbRewardAllowed.find(t => t.address === dbToken.address))
          availableReward[dbToken.address] = dbToken;
      });

      const availableTransactional = {};
      dbTokens.forEach(dbToken => {
        if (!dbTransactionalAllowed.find(t => t.address === dbToken.address))
          availableTransactional[dbToken.address] = dbToken;
      });

      setCurrentAllowedTokens({
        "transactional": dbTransactionalAllowed.map(tokenToAddress),
        "reward": dbRewardAllowed.map(tokenToAddress)
      });

      if (isGovernorRegistry) {
        setSelectedRewardTokens(dbRewardAllowed);
        setSelectedTransactionalTokens(dbTransactionalAllowed);

        setAllowedRewardTokensList(Object.values(availableReward));
        setAllowedTransactionalTokensList(Object.values(availableTransactional));
      } else {
        setAllowedTransactionalTokensList(dbTransactionalAllowed
          .filter(t => tokenNotInSelected(t, defaultSelectedTokens, 'transactional')));
          
        setAllowedRewardTokensList(dbRewardAllowed
          .filter(t => tokenNotInSelected(t, defaultSelectedTokens, 'reward')));
      }
    } catch (error) {
      console.debug("Failed to getAllowedTokensContract", error);
    } finally {
      setIsLoadingTokens(false);
    }
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

    Promise.all(transactions).then(async (txs : { blockNumber: number }[]) => {
      const fromBlock = txs.reduce((acc, tx) => Math.min(acc, tx.blockNumber), Number.MAX_SAFE_INTEGER)
      
      await processEvent("registry", "changed", state.Service?.network?.active.name, { fromBlock });

      await getAllowedTokensContract();
    })
  }


  useEffect(() => {
    if (!state.Service?.active) return;

    getAllowedTokensContract();
      
  }, [state.Service?.active, isGovernorRegistry]);

  useEffect(() => {
    if (defaultSelectedTokens?.length > 0) {
      setSelectedTransactionalTokens(defaultSelectedTokens?.filter((token) => token.isTransactional));
      setSelectedRewardTokens(defaultSelectedTokens?.filter((token) => token.isReward));
    }
  }, [defaultSelectedTokens]);

  useEffect(() => {
    fields.allowedTransactions.setter(selectedTransactionalTokens);
    fields.allowedRewards.setter(selectedRewardTokens);
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
        isloading: isLoadingTokens
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
