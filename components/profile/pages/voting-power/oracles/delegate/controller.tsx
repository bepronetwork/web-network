import { ChangeEvent, useEffect, useRef, useState } from "react";
import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";

import { NetworkEvents } from "interfaces/enums/events";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { OraclesDelegateProps } from "interfaces/oracles-state";

import useApi from "x-hooks/use-api";

import OraclesDelegateView from "./view";

export default function OraclesDelegate({
  wallet,
  updateWalletBalance,
  defaultAddress,
}: OraclesDelegateProps) {
  const { t } = useTranslation(["common", "my-oracles"]);

  const debounce = useRef(null);

  const [error, setError] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>();
  const [delegatedTo, setDelegatedTo] = useState<string>(defaultAddress || "");
  const [availableAmount, setAvailableAmount] = useState<BigNumber>();

  const {
    state: { transactions, Service },
  } = useAppState();

  const { processEvent } = useApi();

  const networkTokenDecimals =
    Service?.network?.active?.networkToken?.decimals || 18;
  const networkTokenSymbol = Service?.network?.active?.networkToken?.symbol;

  function handleChangeOracles(params: NumberFormatValues) {
    if (params.value === "") return setTokenAmount("");

    if (availableAmount.lt(params.value))
      setError(t("my-oracles:errors.amount-greater", { amount: "total" }));
    else setError("");

    setTokenAmount(params.value);
  }

  function setMaxAmount() {
    return setTokenAmount(availableAmount.toFixed());
  }

  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    if (addressError) setAddressError("");
    setDelegatedTo(params.target.value);

    if (Service?.active?.web3Connection && params.target.value) {
      clearTimeout(debounce.current);

      debounce.current = setTimeout(() => {
        const isValid = Service.active.isAddress(params.target.value);
        if (!isValid) setAddressError(t("my-oracles:errors.invalid-wallet"));
      }, 500);
    }
  }

  function handleClickVerification() {
    if (!tokenAmount || !delegatedTo) {
      return setError(t("my-oracles:errors.fill-required-fields"));
    }
  }

  function handleTransition() {
    updateWalletBalance();
    handleChangeOracles({ floatValue: 0, formattedValue: "", value: "" });
    setDelegatedTo("");
    setError("");
  }

  function handleProcessEvent(blockNumber) {
    processEvent(NetworkEvents.OraclesTransfer, undefined, {
      fromBlock: blockNumber,
    }).catch(console.debug);
  }

  const isButtonDisabled = (): boolean =>
    [
      wallet?.balance?.oracles?.locked?.lt(tokenAmount),
      !delegatedTo,
      isAddressesEqual(),
      BigNumber(tokenAmount).isZero(),
      BigNumber(tokenAmount).isNaN(),
      addressError,
      error,
      transactions.find(({ status, type }) =>
          status === TransactionStatus.pending &&
          type === TransactionTypes.delegateOracles),
    ].some((values) => values);

  const isAddressesEqual = () =>
    wallet?.address &&
    delegatedTo?.toLowerCase() === wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!wallet?.balance?.oracles) return;

    setAvailableAmount(wallet?.balance?.oracles?.locked || BigNumber("0"));
  }, [wallet?.balance?.oracles?.locked]);

  return (
    <OraclesDelegateView
      tokenAmount={tokenAmount}
      handleChangeOracles={handleChangeOracles}
      error={error}
      networkTokenDecimals={networkTokenDecimals}
      availableAmount={availableAmount}
      handleMaxAmount={setMaxAmount}
      delegatedTo={delegatedTo}
      handleChangeAddress={handleChangeAddress}
      isAddressesEqual={isAddressesEqual()}
      addressError={addressError}
      networkTokenSymbol={networkTokenSymbol}
      handleClickVerification={handleClickVerification}
      handleProcessEvent={handleProcessEvent}
      handleTransition={handleTransition}
      handleError={setError}
      isButtonDisabled={isButtonDisabled()}
    />
  );
}