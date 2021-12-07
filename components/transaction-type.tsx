import React from 'react';
import {TransactionTypes} from '@interfaces/enums/transaction-types';

export default function TransactionType({type}) {
  const TypeMaps = {
    [TransactionTypes.unknown]: `Unknown`,
    [TransactionTypes.lock]: `Lock`,
    [TransactionTypes.unlock]: `Unlock`,
    [TransactionTypes.approveTransactionalERC20Token]: `Approval`,
    [TransactionTypes.openIssue]: `Open bounty`,
    [TransactionTypes.delegateOracles]: `Delegate`,
    [TransactionTypes.takeBackOracles]: `Removing Delegation`,
    [TransactionTypes.dispute]: `Dispute bounty`,
    [TransactionTypes.proposeMerge]: `Propose merge request`,
    [TransactionTypes.closeIssue]: `Close bounty`,
    [TransactionTypes.redeemIssue]: `Redeem bounty`,
    [TransactionTypes.approveSettlerToken]: `Approve settler token`,
    [TransactionTypes.recognizedAsFinish]: `Recognize bounty as finished`,
  }

  return (<span className="d-block caption-small text-white-50 text-uppercase fs-small">{[TypeMaps[type]] || `Missing map`}</span>)
}
