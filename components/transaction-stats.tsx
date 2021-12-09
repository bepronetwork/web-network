import React from 'react';
import {TransactionStatus} from '@interfaces/enums/transaction-status';

export default function TransactionStats({status = null}: {status: TransactionStatus}) {
  const ColorMap = {
    [TransactionStatus.pending]: `warning`,
    [TransactionStatus.processing]: `info`,
    [TransactionStatus.failed]: `danger`,
    [TransactionStatus.completed]: `success`,
  }

  const StatusMap = {
    [TransactionStatus.pending]: `Pending`,
    [TransactionStatus.processing]: `Processing`,
    [TransactionStatus.failed]: `Rejected`,
    [TransactionStatus.completed]: `Completed`,
  }

  function rowClassName() {
    return `bg-transparent stats caption-small text-uppercase px-2 py-1 rounded border border-2 border-${ColorMap[status]} text-${ColorMap[status]}`
  }

  return <><div className={rowClassName()}><strong>{StatusMap[status]}</strong></div></>
}
