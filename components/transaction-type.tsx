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
    [TransactionTypes.takeBackOracles]: `Removing Delegation`,
    [TransactionTypes.dispute]: `Dispute issue`,
    [TransactionTypes.proposeMerge]: `Propose merge request`,
    [TransactionTypes.closeIssue]: `Close issue`,
    [TransactionTypes.redeemIssue]: `Redeem issue`,
    [TransactionTypes.approveSettlerToken]: `Approve settler token`,
    [TransactionTypes.recognizedAsFinish]: `Recognize issue as finished`,
  }

  return (<span className="d-block text-white-50 text-uppercase fs-small">{[TypeMaps[type]] || `Missing map`}</span>)
}
