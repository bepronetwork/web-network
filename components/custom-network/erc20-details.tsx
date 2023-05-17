import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import ContractButton from "components/contract-button";
import {FormGroup} from "components/form-group";

import {useAppState} from "contexts/app-state";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import { DAPPKIT_LINK } from "helpers/constants";
import {formatStringToCurrency} from "helpers/formatNumber";

import useERC20 from "x-hooks/use-erc20";

interface ERC20DetailsProps {
  address?: string;
  readOnly?: boolean;
  deployer?: boolean;
  minimum?: boolean;
  adressPlaceholder?: string;
  onChange?: (value: string) => void;
  onChangeMinAmount?: (value: string) => void;
}

export function ERC20Details({
  address,
  readOnly,
  deployer,
  minimum,
  adressPlaceholder,
  onChange,
  onChangeMinAmount,
} : ERC20DetailsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenMinAmount, setTokenMinAmount] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [tokenTotalSupply, setTokenTotalSupply] = useState("");

  const erc20 = useERC20();
  const { state, dispatch } = useAppState();

  const isDeployer = !!deployer;

  const numberError = value =>
    BigNumber(value).isNaN() ? 
      t("custom-network:steps.token-configuration.errors.invalid-number") :
      BigNumber(value).lte(0) ? 
        t("custom-network:steps.token-configuration.errors.lower-than-zero") : undefined;

  const tokenInfo = {
    name: isDeployer ? tokenName : erc20?.name,
    symbol: isDeployer ? tokenSymbol : erc20?.symbol,
    decimals: isDeployer ? "18" : erc20?.decimals?.toString(),
    totalSupply: isDeployer ? tokenTotalSupply : formatStringToCurrency(erc20?.totalSupply?.toFixed()),
    minimumValue: isDeployer ? tokenMinAmount : undefined
  }

  const isAddressFieldReadOnly = !!readOnly || isDeployer;
  const hasTotalSupplyError = !!numberError(tokenInfo.totalSupply) && tokenInfo.totalSupply !== "" && isDeployer;

  const isDeployBtnDisabled = isDeployer ? [
    tokenInfo.name.trim() === "",
    tokenInfo.symbol.trim() === "",
    !!numberError(tokenInfo.totalSupply)
  ].some(c => c) : false;

  function handleBlur() {
    erc20.setAddress(tokenAddress);
  }

  function handleDeploy() {
    setIsDeploying(true);

    erc20.deploy(tokenName, tokenSymbol, tokenTotalSupply, state.currentUser?.walletAddress)
      .then(({ contractAddress }) => {
        erc20.setAddress(contractAddress);
        setTokenAddress(contractAddress);
        dispatch(toastSuccess(t("custom-network:steps.token-configuration.messages.token-deployed.content"), 
                              t("custom-network:steps.token-configuration.messages.token-deployed.title")));
      })
      .catch(txError => {
        console.debug(txError.message);

        if (txError.message.includes("value out-of-bounds"))
          dispatch(toastError(t("custom-network:steps.token-configuration.errors.deploy.content"), 
                              t("custom-network:steps.token-configuration.errors.deploy.title")));
      })
      .finally(() => setIsDeploying(false));
  }

  useEffect(() => {
    if (readOnly) {
      setTokenAddress(address);
      erc20.setAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (erc20?.address && erc20?.loadError === false && erc20?.address !== address)
      onChange?.(erc20.address);
    else
      onChange?.("");
  }, [erc20?.address, erc20?.loadError]);

  return(
    <>
      <Row className="mt-2 mb-2">
        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.address.label")}
          value={tokenAddress}
          readOnly={isAddressFieldReadOnly}
          onChange={setTokenAddress}
          onBlur={handleBlur}
          placeholder={adressPlaceholder}
          error={ erc20?.loadError &&
            <>
              {t("custom-network:steps.token-configuration.fields.nft-token.error.pre")}
              {" "}
              <a href={`${DAPPKIT_LINK}classes/ERC20.html`} target="_blank">
                {t("custom-network:steps.token-configuration.fields.nft-token.error.mid")}
              </a>
              {" "}
              {t("custom-network:steps.token-configuration.fields.nft-token.error.post")}
            </>
          }
        />
      </Row>

      <Row className="mb-2">
        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.name.label")}
          value={tokenInfo.name}
          readOnly={!isDeployer || isDeploying}
          onChange={setTokenName}
        />

        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.symbol.label")}
          value={tokenInfo.symbol}
          readOnly={!isDeployer || isDeploying}
          onChange={setTokenSymbol}
        />

        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.decimals.label")}
          value={tokenInfo.decimals}
          readOnly
        />
      </Row>

      <Row>
        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.total-supply.label")}
          placeholder="0"
          value={tokenInfo.totalSupply}
          readOnly={!isDeployer || isDeploying}
          onChange={setTokenTotalSupply}
          variant="numberFormat"
          error={hasTotalSupplyError && numberError(tokenInfo.totalSupply) || ""}
        />

      {minimum && (
          <FormGroup
            label={"Minimum Token value"}
            value={tokenInfo.minimumValue}
            variant="numberFormat"
            onChange={(e) => {
              setTokenMinAmount(e);
              onChangeMinAmount(e);
            }}
          />
        )}

        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.your-balance.label")}
          value={formatStringToCurrency(erc20?.balance?.toFixed())}
          readOnly
        />
      </Row>

      { isDeployer &&
        <Row className="mt-2">
          <Col>
            <ContractButton
              disabled={isDeployBtnDisabled || isDeploying}
              withLockIcon={isDeployBtnDisabled}
              isLoading={isDeploying}
              onClick={handleDeploy}
            >
              {t("custom-network:steps.token-configuration.actions.deploy")}
            </ContractButton>
          </Col>
        </Row>
      }
    </>
  );
}