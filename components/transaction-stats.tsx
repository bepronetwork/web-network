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
    [TransactionStatus.completed]: `Accepted`,
  }

  function rowClassName() {
    return `bg-transparent px-2 py-1 rounded border border-2 border-${ColorMap[status]} text-${ColorMap[status]} fs-small`
  }

  return <><div className={rowClassName()}><strong>{StatusMap[status]}</strong></div></>
}
