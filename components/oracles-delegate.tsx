import { ChangeEvent, useContext, useEffect, useState } from "react";
import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import InputNumber from "components/input-number";
import NetworkTxButton from "components/network-tx-button";
import OraclesBoxHeader from "components/oracles-box-header";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import { ApplicationContext } from "contexts/application";
import { useNetwork } from "contexts/network";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Wallet } from "interfaces/authentication";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

interface OraclesDelegateProps {
  wallet: Wallet;
}

function OraclesDelegate({
  wallet
} : OraclesDelegateProps) {
  const { t } = useTranslation(["common", "my-oracles"]);

  const [error, setError] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>();
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [availableAmount, setAvailableAmount] = useState<BigNumber>();

  const { activeNetwork } = useNetwork();

  const {
    state: { myTransactions }
  } = useContext(ApplicationContext);

  const networkTokenDecimals = activeNetwork?.networkToken?.decimals || 18;
  const networkTokenSymbol = activeNetwork?.networkToken?.symbol;

  function handleChangeOracles(params: NumberFormatValues) {
    if (params.value === "") return setTokenAmount("");

    if (availableAmount.lt(params.value))
      setError(t("my-oracles:errors.amount-greater", { amount: "total" }));
    else setError("");

    setTokenAmount(params.value);
  }

  function setMaxAmmount() {
    return setTokenAmount(availableAmount.toString());
  }

  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    if (error) setError("");
    setDelegatedTo(params.target.value);
  }

  function handleClickVerification() {
    if (!tokenAmount || !delegatedTo) {
      return setError(t("my-oracles:errors.fill-required-fields"));
    }
  }

  function handleTransition() {
    handleChangeOracles({ floatValue: 0, formattedValue: "", value: "" });
    setDelegatedTo("");
    setError("");

  }

  const isButtonDisabled = (): boolean =>
    [
      wallet?.balance?.oracles?.locked?.lt(tokenAmount),
      !delegatedTo,
      isAddressesEqual(),
      BigNumber(tokenAmount).isZero(),
      BigNumber(tokenAmount).isNaN(),
      myTransactions.find(({ status, type }) =>
          status === TransactionStatus.pending &&
          type === TransactionTypes.delegateOracles)
    ].some((values) => values);

  const isAddressesEqual = () => wallet?.address && delegatedTo?.toLowerCase() === wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!wallet?.balance) return;

    setAvailableAmount(wallet?.balance?.oracles?.locked || BigNumber("0"));
  }, [wallet?.balance]);

  return (
    <div className="col-md-6">
      <div className="content-wrapper h-100">
        <OraclesBoxHeader
          actions={t("my-oracles:actions.delegate.title", { token: networkTokenSymbol })}
        />
        <p className="caption-small text-white text-uppercase mt-2 mb-3">
          {t("my-oracles:actions.delegate.description", { token: networkTokenSymbol })}
        </p>
        <InputNumber
          label={t("my-oracles:fields.oracles.label", { token: networkTokenSymbol })}
          value={tokenAmount}
          symbol={t("$oracles", { token: networkTokenSymbol })}
          classSymbol="text-purple"
          onValueChange={handleChangeOracles}
          min={0}
          placeholder={t("my-oracles:fields.oracles.placeholder", { token: networkTokenSymbol })}
          thousandSeparator
          error={!!error}
          decimalScale={networkTokenDecimals}
          allowNegative={false}
          helperText={
            <>
              {formatStringToCurrency(availableAmount?.toFixed())}{" "}
              {`${t("$oracles", { token: networkTokenSymbol })} ${t("misc.available")}`}
              <span
                className="caption-small ml-1 cursor-pointer text-uppercase text-purple"
                onClick={setMaxAmmount}
              >
                {t("misc.max")}
              </span>
              {error && <p className="p-small my-2">{error}</p>}
            </>
          }
        />

        <div className="form-group mt-2">
          <label className="caption-small text-uppercase text-white bg-opacity-100 mb-2">
            {t("my-oracles:fields.address.label")}
          </label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className={`form-control ${
              (isAddressesEqual() && "is-invalid") || ""
            }`}
            placeholder={t("my-oracles:fields.address.placeholder")}
          />
          {(isAddressesEqual() && (
            <small className="text-danger text-italic">
              {t("my-oracles:errors.self-delegate", { token: networkTokenSymbol })}
            </small>
          )) ||
            ""}
        </div>

        {error && <p className="p-small text-danger mt-2">{error}</p>}
        <ReadOnlyButtonWrapper>
          <NetworkTxButton
            txMethod="delegateOracles"
            className="read-only-button"
            txParams={{ tokenAmount, from: delegatedTo }}
            txType={TransactionTypes.delegateOracles}
            txCurrency={t("$oracles", { token: networkTokenSymbol })}
            modalTitle={t("my-oracles:actions.delegate.title", { token: networkTokenSymbol })}
            modalDescription={t("my-oracles:actions.delegate.delegate-to-address", 
                              { token: networkTokenSymbol })}
            onTxStart={handleClickVerification}
            onSuccess={handleTransition}
            onFail={setError}
            buttonLabel={t("my-oracles:actions.delegate.label")}
            fullWidth={true}
            disabled={isButtonDisabled()}
          />
        </ReadOnlyButtonWrapper>
      </div>
    </div>
  );
}

export default OraclesDelegate;
