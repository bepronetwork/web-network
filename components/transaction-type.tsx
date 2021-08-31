import React from 'react';
import {TransactionTypes} from '@interfaces/enums/transaction-types';

export default function TransactionType({type}) {
  const TypeMaps = {
    [TransactionTypes.unknown]: `Unknown`,
    [TransactionTypes.createIssue]: `Create issue`,
    [TransactionTypes.lock]: `Lock`,
    [TransactionTypes.unlock]: `Unlock`,
    [TransactionTypes.approveTransactionalERC20Token]: `Approval`,
    [TransactionTypes.openIssue]: `Open issue`,
    [TransactionTypes.delegateOracles]: `Delegate`,
  }

  return (<span className="d-block text-white-50 fs-small">{[TypeMaps[type]] || `Missing map`}</span>)
}
