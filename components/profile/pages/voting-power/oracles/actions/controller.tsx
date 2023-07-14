import React, {useEffect, useRef, useState} from "react";
import {NumberFormatValues} from "react-number-format";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import {useAppState} from "contexts/app-state";

import {formatNumberToNScale} from "helpers/formatNumber";

import { NetworkEvents } from "interfaces/enums/events";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import { OraclesActionsProps } from "interfaces/oracles-state";

import useApi from "x-hooks/use-api";
import useERC20 from "x-hooks/use-erc20";

import OraclesActionsView from "./view";

export default function OraclesActions({
  wallet,
  updateWalletBalance
} : OraclesActionsProps) {
  const { t } = useTranslation(["common", "my-oracles"]);

  const actions: string[] = [
    String(t("my-oracles:actions.lock.label")),
    String(t("my-oracles:actions.unlock.label"))
  ];

  const [error, setError] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false)
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<string>();

  const networkTokenERC20 = useERC20();

  const { state: { transactions, Service }} = useAppState();

  const { processEvent } = useApi();

  const networkTokenSymbol = networkTokenERC20.symbol || t("misc.$token");
  const networkTokenDecimals = networkTokenERC20.decimals || 18;
  const oracleExchangeRate = Service?.network?.amounts?.oracleExchangeRate || 1;
  const oracleAmount = action === t("my-oracles:actions.lock.label") ?
    BigNumber(tokenAmount || 0).multipliedBy(oracleExchangeRate).toFixed() :
    BigNumber(tokenAmount || 0).dividedBy(oracleExchangeRate).toFixed();

  const exceedsAvailable = value => BigNumber(value).gt(getMaxAmount());

  const networkTxRef = useRef<HTMLButtonElement>(null);

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!transactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  const renderInfo = {
    Lock: {
      title: t("my-oracles:actions.lock.title", { currency: networkTokenSymbol }),
      description:
             t("my-oracles:actions.lock.description", {
               currency: networkTokenSymbol,
               token: Service?.network?.active?.networkToken?.symbol
             }),
      label: t("my-oracles:actions.lock.get-amount-oracles", {
        amount: formatNumberToNScale(oracleAmount, undefined, ""),
        token: Service?.network?.active?.networkToken?.symbol
      }),
      caption: (
        <>
          {t("misc.get")} <span className="text-purple">
                            {t("misc.votes")}
                          </span>{" "}
          {t("misc.from")} <span className="text-primary">
            {networkTokenSymbol}
          </span>
        </>
      ),
      body:
        t("my-oracles:actions.lock.body", {
          amount: formatNumberToNScale(tokenAmount, undefined, ""),
          oracleAmount: formatNumberToNScale(oracleAmount, undefined, ""),
          currency: networkTokenSymbol,
          token: Service?.network?.active?.networkToken?.symbol
        }),
      params() {
        return { tokenAmount };
      }
    },
    Unlock: {
      title:
        t("my-oracles:actions.unlock.title", { currency: networkTokenSymbol }),
      description:
        t("my-oracles:actions.unlock.description", {
          currency: networkTokenSymbol,
          token: Service?.network?.active?.networkToken?.symbol
        }),
      label: t("my-oracles:actions.unlock.get-amount-bepro", {
        amount: formatNumberToNScale(oracleAmount),
        currency: networkTokenSymbol,
        token: Service?.network?.active?.networkToken?.symbol
      }),
      caption: (
        <>
          {t("misc.get")} <span className="text-primary">
            { networkTokenSymbol}</span>{" "}
          {t("misc.from")} <span className="text-purple">
                            {t("$oracles", { token: Service?.network?.active?.networkToken?.symbol })}
                           </span>
        </>
      ),
      body: t("my-oracles:actions.unlock.body", {
        amount: formatNumberToNScale(tokenAmount),
        oracleAmount: formatNumberToNScale(oracleAmount),
        currency: networkTokenSymbol,
        token: Service?.network?.active?.networkToken?.symbol
      }),
      params(from: string) {
        return { tokenAmount, from };
      }
    }
  }[action];

  const isButtonDisabled = (): boolean =>
    [
      action === t("my-oracles:actions.lock.label") && needsApproval(),
      !wallet?.address,
      BigNumber(tokenAmount).isZero(),
      BigNumber(tokenAmount).isNaN(),
      exceedsAvailable(tokenAmount),
      !tokenAmount,
      transactions.find(({ status, type }) =>
          status === TransactionStatus.pending && type === getTxType())
    ].some((values) => values);

  function handleCheck() {
    if (!tokenAmount) {
      return setError(t("my-oracles:errors.amount-higher-0", {
        currency: networkTokenSymbol
      }));
    }
    const isChecked = !needsApproval();
    setShow(isChecked);
    setError(!isChecked ? t("my-oracles:errors.approve-transactions", { currency: networkTokenSymbol }) : "")
  }

  function onSuccess() {
    setError("");
    setTokenAmount("");
    updateWalletBalance();
    networkTokenERC20.updateAllowanceAndBalance();
  }

  function handleProcessEvent(blockNumber) {
    processEvent(NetworkEvents.OraclesChanged, undefined, { fromBlock: blockNumber })
      .catch(console.debug);
  }

  function handleChangeToken(params: NumberFormatValues) {
    if (error) setError("");

    if (params.value === "") return setTokenAmount(undefined);

    if (exceedsAvailable(params.value))
      setError(t("my-oracles:errors.amount-greater", { amount: getCurrentLabel() }));

    setTokenAmount(params.value);
  }

  function handleConfirm() {
    setShow(false);
    networkTxRef?.current?.click();
  }

  function handleCancel() {
    setTokenAmount("0");
    setShow(false);
  }

  function approveSettlerToken() {
    setIsApproving(true);

    networkTokenERC20.approve(tokenAmount)
      .catch(error => console.debug("Failed to approve", error))
      .finally(() => setIsApproving(false));
  }

  function getCurrentLabel() {
    return action === t("my-oracles:actions.lock.label")
      ? networkTokenSymbol
      : t("token-votes", { token: "" });
  }

  function getMaxAmount(trueValue = false): string {
    const amount = action === t("my-oracles:actions.lock.label")
      ? wallet?.balance?.bepro?.toFixed()
      : wallet?.balance?.oracles?.locked?.toFixed();

    if (!amount)
      return '0';

    if (trueValue)
      return amount;

    return formatNumberToNScale(amount, undefined, "");
  }

  function setMaxAmount() {
    return setTokenAmount(getMaxAmount(true));
  }

  function getTxType() {
    return action === t("my-oracles:actions.lock.label")
      ? TransactionTypes.lock
      : TransactionTypes.unlock;
  }

  const needsApproval = () =>
    networkTokenERC20.allowance.isLessThan(tokenAmount) && action === t("my-oracles:actions.lock.label");

  useEffect(() => {
    if (Service?.active?.network?.networkToken?.contractAddress)
      networkTokenERC20.setAddress(Service?.active?.network?.networkToken?.contractAddress);
  }, [Service?.active?.network?.networkToken?.contractAddress]);

  return (
      <OraclesActionsView 
        wallet={wallet} 
        actions={actions} 
        action={action} 
        handleAction={setAction} 
        renderInfo={renderInfo} 
        currentLabel={getCurrentLabel()} 
        networkTokenSymbol={Service?.network?.active?.networkToken?.symbol} 
        error={error} 
        tokenAmount={tokenAmount} 
        handleChangeToken={handleChangeToken} 
        networkTokenDecimals={networkTokenDecimals} 
        getMaxAmount={getMaxAmount} 
        handleMaxAmount={setMaxAmount}
        needsApproval={needsApproval()} 
        isApproving={isApproving} 
        approveSettlerToken={approveSettlerToken} 
        verifyTransactionState={verifyTransactionState} 
        isButtonDisabled={isButtonDisabled()} 
        handleCheck={handleCheck} 
        txType={getTxType()} 
        handleProcessEvent={handleProcessEvent} 
        onSuccess={onSuccess} 
        handleError={setError} 
        networkTxRef={networkTxRef} 
        show={show} 
        handleCancel={handleCancel} 
        handleConfirm={handleConfirm}      
      />
  );
}