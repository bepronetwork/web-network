import React from 'react';
import {TransactionStatus} from '@interfaces/enums/transaction-status';

export default function TransactionStats({status = null}: {status: TransactionStatus}) {
  const ColorMap = {
    [TransactionStatus.pending]: `warning`,
    [TransactionStatus.processing]: `info`,
    [TransactionStatus.completed]: `success`,
  }

  const StatusMap = {
    [TransactionStatus.completed]: `Complete`,
    [TransactionStatus.pending]: `Pending`,
    [TransactionStatus.processing]: `Processing`,
  }

  function rowClassName() {
    return `bg-transparent px-2 py-1 rounded border border-${ColorMap[status]} text-${ColorMap[status]} fs-small`
  }

  return <><div className={rowClassName()}>{StatusMap[status]}</div></>
}
