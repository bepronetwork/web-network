import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import If from "components/If";
import MultipleTokensDropdown from "components/multiple-tokens-dropdown";
import {WarningSpan} from "components/warning-span";

import {useAppState} from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

import {Token, TokenType} from "interfaces/token";

import useApi from "x-hooks/use-api";

export default function TokensSettings({
  isGovernorRegistry = false,
  defaultSelectedTokens,
  disabled,
  onChangeCb
}: {
  isGovernorRegistry?: boolean;
  disabled?: boolean;
  defaultSelectedTokens?: Token[];
  onChangeCb?: (transactional: Token[], reward: Token[]) => void;
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const {state} = useAppState();

  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>();
  const [allowedRewardTokensList, setAllowedRewardTokensList] = useState<Token[]>();
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] = useState<Token[]>();
  const [allowedTransactionalTokensList, setAllowedTransactionalTokensList] = useState<Token[]>();

  const { getTokens } = useApi();

  const {
    fields
  } = useNetworkSettings();

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
      const dbTokens = await getTokens(state.connectedChain?.id);

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

      if (isGovernorRegistry) {
        setAllowedRewardTokensList(Object.values(availableReward));
        setAllowedTransactionalTokensList(Object.values(availableTransactional));
        setSelectedRewardTokens(dbRewardAllowed);
        setSelectedTransactionalTokens(dbTransactionalAllowed);
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

  useEffect(() => {
    if (!state.Service?.active || !state.connectedChain?.id) return;

    getAllowedTokensContract();
      
  }, [state.Service?.active, state.connectedChain?.id, isGovernorRegistry]);

  useEffect(() => {
    if (defaultSelectedTokens?.length > 0) {
      setSelectedTransactionalTokens(defaultSelectedTokens?.filter((token) => token.isTransactional));
      setSelectedRewardTokens(defaultSelectedTokens?.filter((token) => token.isReward));
    }
  }, [defaultSelectedTokens]);

  useEffect(() => {
    fields.allowedTransactions.setter(selectedTransactionalTokens);
    fields.allowedRewards.setter(selectedRewardTokens);
    onChangeCb?.(selectedTransactionalTokens, selectedRewardTokens);
  }, [selectedRewardTokens, selectedTransactionalTokens]);

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
      <MultipleTokensDropdown {...tokenData[type]} disabled={disabled} />
    )
  }

  return (
    <Col>
      <Row className="mb-3">
        <span className="caption-medium font-weight-medium text-white text-capitalize">
          {isGovernorRegistry
            ? t("custom-network:config-tokens-registry")
            : t("custom-network:config-tokens")}
        </span>
      </Row>

      <Row>
        <Col xs="12" md="6">
          {handleSelectTokens("transactional")}
        </Col>

        <Col xs="12" md="6">
          {handleSelectTokens("reward")}
        </Col>
      </Row>

      <If condition={isGovernorRegistry}>
        <WarningSpan
          text={t("custom-network:steps.network-settings.fields.other-settings.warning-add-remove-allowed-tokens")}
        />
      </If>
    </Col>
  );
}
