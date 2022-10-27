import { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import { FormGroup } from "components/form-group";
import InputNumber from "components/input-number";
import { WarningSpan } from "components/warning-span";

import { useAuthentication } from "contexts/authentication";

import { formatStringToCurrency } from "helpers/formatNumber";

import useERC20 from "x-hooks/use-erc20";

interface ERC20DetailsProps {
  address?: string;
  readOnly?: boolean;
  deployer?: boolean;
  onChange?: (value: string) => void;
}

export function ERC20Details({
  address,
  readOnly,
  deployer,
  onChange
} : ERC20DetailsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [tokenTotalSupply, setTokenTotalSupply] = useState("");

  const erc20 = useERC20();
  const { wallet } = useAuthentication();

  const isDeployer = !!deployer;

  const naNOrZeroError = value =>
    BigNumber(value).isNaN() ? 
      t("custom-network:steps.token-configuration.errors.invalid-number") :
      BigNumber(value).lte(0) ? 
        t("custom-network:steps.token-configuration.errors.lower-than-zero") : undefined;

  const tokenInfo = {
    name: isDeployer ? tokenName : erc20?.name,
    symbol: isDeployer ? tokenSymbol : erc20?.symbol,
    decimals: isDeployer ? "18" : erc20?.decimals?.toString(),
    totalSupply: isDeployer ? tokenTotalSupply : formatStringToCurrency(erc20?.totalSupply?.toFixed()),
  }

  const isAddressFieldReadOnly = !!readOnly || isDeployer;
  const hasTotalSupplyError = naNOrZeroError(tokenInfo.totalSupply) && tokenInfo.totalSupply !== "" && isDeployer;

  const handleTotalSupplyChange = ({ value }) => setTokenTotalSupply(value);

  const isDeployBtnDisabled = isDeployer ? [
    tokenInfo.name.trim() === "",
    tokenInfo.symbol.trim() === "",
    !!naNOrZeroError(tokenInfo.totalSupply)
  ].some(c => c) : false;

  function handleBlur() {
    erc20.setAddress(tokenAddress);
  }

  function handleDeploy() {
    setIsDeploying(true);

    erc20.deploy(tokenName, tokenSymbol, tokenTotalSupply, wallet?.address)
      .then(({ contractAddress }) => {
        erc20.setAddress(contractAddress);
        setTokenAddress(contractAddress);
      })
      .catch(txError => {
        console.log(txError);
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
      <Row className="mt-2">
        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.address.label")}
          value={tokenAddress}
          readOnly={isAddressFieldReadOnly}
          onChange={setTokenAddress}
          onBlur={handleBlur}
          error={ erc20?.loadError &&
            <>
              {t("custom-network:steps.token-configuration.fields.nft-token.error.pre")}
              {" "}
              <a href="https://sdk.dappkit.dev/classes/ERC20.html" target="_blank">
                {t("custom-network:steps.token-configuration.fields.nft-token.error.mid")}
              </a>
              {" "}
              {t("custom-network:steps.token-configuration.fields.nft-token.error.post")}
            </>
          }
        />
      </Row>

      <Row>
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
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="caption-small">
              {t("custom-network:steps.token-configuration.fields.total-supply.label")}
            </Form.Label>
            
            <InputNumber
              onValueChange={handleTotalSupplyChange}
              value={tokenInfo.totalSupply}
              readOnly={!isDeployer || isDeploying}
              allowNegative={false}
              decimalScale={0}
              thousandSeparator
            />

            { hasTotalSupplyError &&
              <WarningSpan
                type="danger"
                text={naNOrZeroError(tokenInfo.totalSupply)}
              />
            }
          </Form.Group>
        </Col>

        <FormGroup
          label={t("custom-network:steps.token-configuration.fields.your-balance.label")}
          value={formatStringToCurrency(erc20?.balance?.toFixed())}
          readOnly
        />
      </Row>

      { isDeployer &&
        <Row>
          <Col>
            <Button
              disabled={isDeployBtnDisabled || isDeploying}
              withLockIcon={isDeployBtnDisabled}
              isLoading={isDeploying}
              onClick={handleDeploy}
            >
              {t("custom-network:steps.token-configuration.actions.deploy")}
            </Button>
          </Col>
        </Row>
      }
    </>
  );
}