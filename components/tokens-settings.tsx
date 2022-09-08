import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { handleAllowedTokensDatabase } from "helpers/handleAllowedTokens";

import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";

import Button from "./button";
import MultipleTokensDropdown from "./multiple-tokens-dropdown";
import { WarningSpan } from "./warning-span";

export default function TokensSettings({
  isGovernorRegistry = false,
  defaultSelectedTokens,
  setCurrentSelectedTokens,
}: {
  isGovernorRegistry?: boolean;
  setCurrentSelectedTokens?: ({
    transactional,
    reward,
  }: {
    transactional: Token[];
    reward: Token[];
  }) => void;
  defaultSelectedTokens?: Token[];
}) {
  const { t } = useTranslation(["common", "custom-network"]);
  const { service: DAOService } = useDAO();

  const [currentAllowedTokens, setCurrentAllowedTokens] = useState<{
    transactional: string[];
    reward: string[];
  }>();
  const [allowedRewardTokens, setAllowedRewardTokens] = useState<Token[]>();
  const [selectedRewardTokens, setSelectedRewardTokens] = useState<Token[]>();
  const [selectedTransactionalTokens, setSelectedTransactionalTokens] =
    useState<Token[]>();
  const [transansactionLoading, setTransansactionLoading] =
    useState<boolean>(false);
  const [allowedTransactionalTokens, setAllowedTransactionalTokens] =
    useState<Token[]>();
  const { getTokens, processEvent } = useApi();
  const { activeNetwork } = useNetwork();
  
  useEffect(() => {
    if (!DAOService) return;

    if (isGovernorRegistry) {
      getAllowedTokensContract();
    }

    if (!isGovernorRegistry) {
      DAOService.getAllowedTokens().then((allowedTokens) => {
        getTokens()
          .then((tokens) => {
            const { transactional, reward } = handleAllowedTokensDatabase(allowedTokens, tokens)
            setAllowedTransactionalTokens(transactional);
            setAllowedRewardTokens(reward);
          })
          .catch((err) => console.log("error to get tokens database ->", err));
      }).catch((err) => console.log("error to get allowed tokens ->", err));
    }
  }, [isGovernorRegistry]);

  useEffect(() => {
    if (defaultSelectedTokens?.length > 0) {
      setSelectedTransactionalTokens(defaultSelectedTokens?.filter((token) => token.isTransactional === true));
      setSelectedRewardTokens(defaultSelectedTokens?.filter((token) => token.isTransactional === false));
    }
  }, [defaultSelectedTokens]);

  useEffect(() => {
    if (!setCurrentSelectedTokens) return;

    setCurrentSelectedTokens({
      transactional: selectedTransactionalTokens,
      reward: selectedRewardTokens,
    });
  }, [selectedRewardTokens, selectedTransactionalTokens]);

  async function getAllowedTokensContract() {
    DAOService.getAllowedTokens().then(async (tokens) => {

      setCurrentAllowedTokens(tokens);
      if(tokens?.reward?.length === 0) setSelectedRewardTokens([])
      if(tokens?.transactional?.length === 0) setSelectedTransactionalTokens([])

      if (tokens?.transactional?.length > 0) {
        await Promise.all(tokens?.transactional?.map(async (address) => {
          const token = await DAOService.getERC20TokenData(address);
          return token;
        })).then((token) => {
          setTransansactionLoading(false);
          setAllowedTransactionalTokens(token);
          setSelectedTransactionalTokens(token);
        });
      }

      if (tokens?.reward?.length > 0) {
        await Promise.all(tokens?.reward?.map(async (address) => {
          const token = await DAOService.getERC20TokenData(address);
          return token;
        })).then((token) => {
          setAllowedRewardTokens(token);
          setSelectedRewardTokens(token);
        });
      } 
    });
  }

  function addRewardToken(newToken: Token) {
    setAllowedRewardTokens((oldState) => {
      if (oldState) return [...oldState, newToken];
      return [newToken];
    });
  }

  function addTransactionalToken(newToken: Token) {
    setAllowedTransactionalTokens((oldState) => {
      if (oldState) return [...oldState, newToken];
      return [newToken];
    });
  }

  function changeSelectedTransactionalTokens(newToken: Token[]) {
    setSelectedTransactionalTokens(newToken);
  }

  function changeSelectedRewardTokens(newToken: Token[]) {
    setSelectedRewardTokens(newToken);
  }

  async function addTransactionalTokens() {
    const addTransactionalTokens = selectedTransactionalTokens
      ?.map(({ address }) => {
        const token = currentAllowedTokens?.transactional?.find((currentAddress) => address === currentAddress);
        if (!token) return address;
      })
      .filter((v) => v);

    if (addTransactionalTokens.length > 0) {
      await DAOService.addAllowedTokens(addTransactionalTokens, true)
      .then((txInfo) => {
        processEvent("registry", "changed", activeNetwork?.name, { 
          fromBlock: (txInfo as { blockNumber: number }).blockNumber 
        })
        getAllowedTokensContract();
      })
    }
  }

  function removeTransactionalTokens() {
    const removeTransactionalTokens = currentAllowedTokens?.transactional?.map((currentAddress) => {
      const token = selectedTransactionalTokens?.find(({ address }) => address === currentAddress);
      if (!token) return currentAddress;
    }).filter(v => v)

    if (removeTransactionalTokens.length > 0) {
      DAOService.removeAllowedTokens(removeTransactionalTokens, true)
      .then((txInfo) => {
        processEvent("registry", "changed", activeNetwork?.name, { 
          fromBlock: (txInfo as { blockNumber: number }).blockNumber 
        })
        getAllowedTokensContract();
      })
    }
  }

  function saveTransactionalTokens() {
    addTransactionalTokens()
    removeTransactionalTokens()
  }

  function saveRewardTokens() {
    addRewardTokens()
    removeRewardTokens()
  }

  function addRewardTokens() {
    const addRewardTokens = selectedRewardTokens?.map(({ address }) => {
      const token = currentAllowedTokens?.reward?.find((currentAddress) => address === currentAddress);
      if (!token) return address
    }).filter(v => v)
    
    if (addRewardTokens.length > 0) {
      DAOService.addAllowedTokens(addRewardTokens, false)
      .then((txInfo) => {
        processEvent("registry", "changed", activeNetwork?.name, { 
          fromBlock: (txInfo as { blockNumber: number }).blockNumber 
        })
        getAllowedTokensContract();
      })
    }
  }

  function removeRewardTokens() {
    const removeRewardTokens = currentAllowedTokens?.reward?.map((currentAddress) => {
      const token = selectedRewardTokens?.find(({ address }) => address === currentAddress);
      if (!token) return currentAddress
    }).filter(v => v)

    if (removeRewardTokens.length > 0) {
      DAOService.removeAllowedTokens(removeRewardTokens, false)
      .then((txInfo) => {
        processEvent("registry", "changed", activeNetwork?.name, { 
          fromBlock: (txInfo as { blockNumber: number }).blockNumber 
        })
        getAllowedTokensContract();
      })
    }
  }

  function renderButtons(isTransactional: boolean) {
    const saveMethod = isTransactional
      ? saveTransactionalTokens
      : saveRewardTokens;

    return (
      <div className="d-flex">
        <Button className="mb-2" onClick={saveMethod}>
          <span>
          {isTransactional
              ? t("custom-network:save-transactional-config")
              : t("custom-network:save-reward-config")}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Row className="mt-1">
        <span className="caption-medium text-white mb-3">
          {isGovernorRegistry
            ? t("custom-network:config-tokens-registry")
            : t("custom-network:config-tokens")}
        </span>
        <Col xs={8}>
          <MultipleTokensDropdown
            key="select-multi-transactional"
            label={t("select-multiple.allowed-transactional-tokens")}
            description={t("select-multiple.add-transactional-tokens")}
            addToken={addTransactionalToken}
            tokens={allowedTransactionalTokens}
            canAddToken={isGovernorRegistry}
            selectedTokens={selectedTransactionalTokens}
            changeSelectedTokens={changeSelectedTransactionalTokens}
            isloading={transansactionLoading}
          />
        </Col>
      </Row>
      {isGovernorRegistry && (
        <>
          <Row>
            <Col xs={6}>{renderButtons(true)}</Col>
          </Row>
          <div className="mb-3">
            <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-add-remove-allowed-tokens")}
            />
          </div>
        </>
      )}
      <Row>
        <Col xs={8}>
          <MultipleTokensDropdown
            key="select-multi-reward"
            label={t("select-multiple.allowed-reward-tokens")}
            description={t("select-multiple.add-reward-tokens")}
            addToken={addRewardToken}
            tokens={allowedRewardTokens}
            canAddToken={isGovernorRegistry}
            selectedTokens={selectedRewardTokens}
            changeSelectedTokens={changeSelectedRewardTokens}
          />
        </Col>
      </Row>
      {isGovernorRegistry && (
        <Row className="mb-4">
          <Col xs={6}>{renderButtons(false)}</Col>
        </Row>
      )}
    </>
  );
}
