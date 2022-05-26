import React from "react";

import { useTranslation } from "next-i18next";

import { TransactionStatus } from "interfaces/enums/transaction-status";

export default function TransactionStats({
  status = null
}: {
  status: TransactionStatus;
}) {
  const { t } = useTranslation("common");

  const ColorMap = {
    [TransactionStatus.pending]: "warning",
    [TransactionStatus.processing]: "info",
    [TransactionStatus.failed]: "danger",
    [TransactionStatus.rejected]: "danger",
    [TransactionStatus.completed]: "success"
  };

  const StatusMap = {
    [TransactionStatus.pending]: t("transactions.stats.pending"),
    [TransactionStatus.processing]: t("transactions.stats.processing"),
    [TransactionStatus.failed]: t("transactions.stats.rejected"),
    [TransactionStatus.rejected]: t("transactions.stats.rejected"),
    [TransactionStatus.completed]: t("transactions.stats.completed")
  };

  function rowClassName() {
    return `bg-transparent stats caption-small text-uppercase 
            px-2 py-1 rounded border border-2 
            border-${ColorMap[status]} text-${ColorMap[status]}`;
  }

  return (
    <>
      <div className={rowClassName()}>
        <strong>{StatusMap[status]}</strong>
      </div>
    </>
  );
}
