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
  setCurrentSelectedTokens
}: {
  isGovernorRegistry?: boolean;
  setCurrentSelectedTokens?: ({
    transactional,
    reward
}: {
    transactional: Token[],
    reward: Token[]
}) => void,
  defaultSelectedTokens?: Token[]
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
  const { getTokens } = useApi() 

  useEffect(() => {
    if (!DAOService) return;

    if(isGovernorRegistry) getAllowedTokensContract();

    if(!isGovernorRegistry) {
      getTokens().then(tokens => {
        setAllowedTransactionalTokens(tokens.filter((token) => token.isTransactional === true))
        setAllowedRewardTokens(tokens.filter((token) => token.isTransactional === false))
      }).catch(err => console.log('err tokens ->', err))
    }
  }, [isGovernorRegistry]);

  useEffect(() => {
    if(defaultSelectedTokens?.length > 0) {
      setSelectedTransactionalTokens(defaultSelectedTokens?.filter((token) => token.isTransactional === true))
      setSelectedRewardTokens(defaultSelectedTokens?.filter((token) => token.isTransactional === false))
    }
  },[defaultSelectedTokens])

  useEffect(() => {
    if(!setCurrentSelectedTokens) return;

    setCurrentSelectedTokens({
        transactional: selectedTransactionalTokens,
        reward: selectedRewardTokens
    })
  }, [selectedRewardTokens, selectedTransactionalTokens])

  async function getAllowedTokensContract() {
    DAOService.getAllowedTokens().then(async (tokens) => {
      setCurrentAllowedTokens(tokens);
      if (tokens?.transactional?.length > 0) {
        Promise.all(tokens?.transactional?.map(async (address) => {
          const token = await DAOService.getERC20TokenData(address);
          return token;
        })).then((token) => {
          setTransansactionLoading(false);
          setAllowedTransactionalTokens(token);
          setSelectedTransactionalTokens(token);
        });
      }
      if (tokens?.reward?.length > 0) {
        Promise.all(tokens?.reward?.map(async (address) => {
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
    const addTransactionalTokens = [];

    selectedTransactionalTokens?.map(({ address }) => {
      const token = currentAllowedTokens?.transactional?.find((currentAddress) => address === currentAddress);
      if (!token) addTransactionalTokens.push(address);
    });

    if (addTransactionalTokens.length > 0) {
      setTransansactionLoading(true);
      try {
        await DAOService.addAllowedTokens(addTransactionalTokens, true)
      } catch (err) {
        console.log("err", err);
      }
    }
  }

  async function removeTransactionalTokens() {
    const removeTransactionalTokens = [];

    currentAllowedTokens?.transactional?.map((currentAddress) => {
      const token = selectedTransactionalTokens?.find(({ address }) => address === currentAddress);
      if (!token) removeTransactionalTokens.push(currentAddress);
      return currentAddress;
    });

    setTransansactionLoading(true);
    DAOService.removeAllowedTokens(removeTransactionalTokens, true)
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));
    await getAllowedTokensContract();
  }

  async function addRewardTokens() {
    const addRewardTokens = [];

    selectedRewardTokens?.map(({ address }) => {
      const token = currentAllowedTokens?.transactional?.find((currentAddress) => address === currentAddress);
      if (!token) addRewardTokens.push(address);
    });

    try {
      if (addRewardTokens.length > 0) {
        setTransansactionLoading(true);
        await DAOService.addAllowedTokens(addRewardTokens, false);
        await getAllowedTokensContract();
        setTransansactionLoading(false);
      }
    } catch (err) {
      console.log("errr", err);
    }
  }

  async function removeRewardTokens() {
    const removeRewardTokens = [];

    currentAllowedTokens?.transactional?.map((currentAddress) => {
      const token = selectedRewardTokens?.find(({ address }) => address === currentAddress);
      if (!token) removeRewardTokens.push(currentAddress);
    });

    try {
      if (removeRewardTokens.length > 0) {
        setTransansactionLoading(true);
        await DAOService.removeAllowedTokens(removeRewardTokens, false);
        await getAllowedTokensContract();
      }
    } catch (err) {
      console.log("errr", err);
    }
  }

  function renderButtons(isTransactional: boolean) {
    const addMethod = isTransactional
      ? addTransactionalTokens
      : addRewardTokens;
    const removeMethod = isTransactional
      ? removeTransactionalTokens
      : removeRewardTokens;

    return (
      <div className="d-flex">
        <Button className="mb-2" onClick={addMethod}>
          <span>{t("custom-network:add-tokens")}</span>
        </Button>

        <Button color="danger" className="mb-2" onClick={removeMethod}>
          <span>{t("custom-network:remove-tokens")}</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Row className="mt-1">
        <span className="caption-medium text-white mb-3">
          {isGovernorRegistry ? t("custom-network:config-tokens-registry") : t("custom-network:config-tokens")}
        </span>
        <Col xs={8}>
          <MultipleTokensDropdown
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
