import React from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import Button from "components/button";
import TransactionStats from "components/transaction-stats";
import TransactionType from "components/transaction-type";
import {TransactionIcon} from "components/transactions-icon";

import {useAppState} from "contexts/app-state";
import {setTxList,} from "contexts/reducers/change-tx-list";

import {formatNumberToNScale, formatStringToCurrency} from "helpers/formatNumber";

import {Transaction} from "interfaces/transaction";

import {useTransactions} from "x-hooks/use-transactions";

import TokenSymbolView from "./common/token-symbol/view";

interface TransactionListProps {
  onActiveTransactionChange: (transaction: Transaction) => void
}

export default function TransactionsList({onActiveTransactionChange}: TransactionListProps) {
  const { t } = useTranslation("common");

  const { deleteFromStorage } = useTransactions();
  const { dispatch, state: { transactions } } = useAppState();

  function renderTransactionRow(item: Transaction) {
    const className = "h-100 w-100 px-3 py-2 tx-row mt-2 cursor-pointer";

    let amount;
    const bnAmount = BigNumber(item.amount);

    if (bnAmount.gt(1))
      amount = formatNumberToNScale(bnAmount.toFixed(), 2, '');
    else if (bnAmount.lt(0.000001))
      amount = `less than 0.000001`;
    else amount = bnAmount.toFixed();

    return (
      <div
        className={className}
        onClick={() => onActiveTransactionChange(item)}
        key={item.id}
      >
        <div className="d-flex justify-content-start align-items-center">
          <TransactionIcon type={item.type} />

          <div className="ms-3 me-auto">
            <TransactionType type={item.type} />

            {(+item.amount > 0 && (
              <span className="d-flex caption-medium text-gray text-uppercase">
                {formatStringToCurrency(amount)} <TokenSymbolView name={item.currency} className="ms-1"/> 
              </span>
            )) ||
              ""}
          </div>

          <TransactionStats status={item.status} />
        </div>
      </div>
    );
  }

  function emptyTransaction() {
    return (
      <div className="text-center">
        <span className="caption-small text-light-gray text-uppercase fs-8 family-Medium">
          {t("transactions.no-transactions")}
        </span>
      </div>
    );
  }

  function clearTransactionsList() {
    deleteFromStorage();
    dispatch(setTxList([]));
  }

  return (
    <div className="transaction-list w-100">
      <div className="d-flex flex-row justify-content-between">
        <h4 className="h4 m-0 text-white">{t("transactions.title_other")}</h4>
        { 
          transactions.length &&
          <Button 
            textClass="text-danger" 
            className="px-0" 
            onClick={clearTransactionsList} 
            transparent
          >
            {t("actions.clear-all")}
            </Button>  || <></>
        }
      </div>
      <div className="overflow-auto tx-container mt-1 pt-2">
        {(!transactions || !transactions.length) && emptyTransaction()}
        {transactions.sort((a, b) => a.date < b.date ? 1 : 0).map(renderTransactionRow)}
      </div>
    </div>
  );
}
