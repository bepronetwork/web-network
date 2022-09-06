import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import { useDAO } from "contexts/dao";

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
  const [isInterval, setIsInterval] = useState<boolean>(false);
  const { getTokens, updateAllowedTokens } = useApi();

  useEffect(() => {
    if (!DAOService) return;

    if (isGovernorRegistry) getAllowedTokensContract();

    if (!isGovernorRegistry) {
      getTokens()
        .then((tokens) => {
          setAllowedTransactionalTokens(tokens.filter((token) => token.isTransactional === true));
          setAllowedRewardTokens(tokens.filter((token) => token.isTransactional === false));
        })
        .catch((err) => console.log("error to get tokens:", err));
    }
  }, [isGovernorRegistry]);

  useEffect(() => {
    if (!isInterval) return;
    const interval = setInterval(() => {
      getAllowedTokensContract();
      updateAllowedTokens().catch(err => console.log("error when synchronizing tokens to database", err))
    }, 30000);

    return () => clearInterval(interval);
  }, [isInterval]);

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

  function addTransactionalTokens() {
    const addTransactionalTokens = selectedTransactionalTokens
      ?.map(({ address }) => {
        const token = currentAllowedTokens?.transactional?.find((currentAddress) => address === currentAddress);
        if (!token) return address;
      })
      .filter((v) => v);

    if (addTransactionalTokens.length > 0) {
      DAOService.addAllowedTokens(addTransactionalTokens, true).catch(() => {
        setIsInterval(false);
      });
    }
  }

  function removeTransactionalTokens() {
    const removeTransactionalTokens = currentAllowedTokens?.transactional?.map((currentAddress) => {
      const token = selectedTransactionalTokens?.find(({ address }) => address === currentAddress);
      if (!token) return currentAddress;
    }).filter(v => v)

    if (removeTransactionalTokens.length > 0) {
      DAOService.removeAllowedTokens(removeTransactionalTokens, true).catch(() => {
        setIsInterval(false);
      });
    }
  }

  function saveTransactionalTokens() {
    addTransactionalTokens()
    removeTransactionalTokens()
    setIsInterval(true);
  }

  function saveRewardTokens() {
    addRewardTokens()
    removeRewardTokens()
    setIsInterval(true);
  }

  function addRewardTokens() {
    const addRewardTokens = selectedRewardTokens?.map(({ address }) => {
      const token = currentAllowedTokens?.reward?.find((currentAddress) => address === currentAddress);
      if (!token) return address
    }).filter(v => v)
    
    if (addRewardTokens.length > 0) {
      DAOService.addAllowedTokens(addRewardTokens, false).catch(() => {
        setIsInterval(false);
      });
    }
  }

  function removeRewardTokens() {
    const removeRewardTokens = currentAllowedTokens?.reward?.map((currentAddress) => {
      const token = selectedRewardTokens?.find(({ address }) => address === currentAddress);
      if (!token) return currentAddress
    }).filter(v => v)

    if (removeRewardTokens.length > 0) {
      DAOService.removeAllowedTokens(removeRewardTokens, false).catch(() => {
        setIsInterval(false);
      });
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
        {isGovernorRegistry && (
          <div className="mb-3">
            <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-sync-tokens-database")}
            />
          </div>
      )}
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
