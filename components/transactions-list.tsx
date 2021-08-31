import React, {useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import UploadIcon from '@assets/icons/upload';
import DownloadIcon from '@assets/icons/download';
import HelpIcon from '@assets/icons/help-icon';
import {Transaction} from '@interfaces/transaction';
import TransactionModal from '@components/transaction-modal';
import TransactionStats from '@components/transaction-stats';
import TransactionType from '@components/transaction-type';

export default function TransactionsList({onActiveTransaction = (transaction) => {}}) {
  const {state: {myTransactions}} = useContext(ApplicationContext);


  const IconMaps = {
    [TransactionTypes.unknown]: <HelpIcon/>,
    [TransactionTypes.createIssue]: <HelpIcon/>,
    [TransactionTypes.lock]: <UploadIcon/>,
    [TransactionTypes.unlock]: <DownloadIcon/>,
    [TransactionTypes.approveTransactionalERC20Token]: <HelpIcon/>,
    [TransactionTypes.openIssue]: <HelpIcon/>,
  }

  function renderTransactionRow(item: Transaction) {
    return (
      <div className="px-3 rounded py-2 tx-row cursor-pointer mt-3" onClick={() => onActiveTransaction(item)} key={item.id}>
        <div className="d-flex justify-content-start align-items-center">
          {IconMaps[item.type]}

          <div className="ms-3 me-auto">
            {item.amount && <h6 className="text-white">{item.amount} {item.currency}</h6> || ``}
            <TransactionType type={item.type}/>
          </div>

          <div>
            <TransactionStats status={item.status}/>
          </div>

        </div>
      </div>
    )
  }

  if (!myTransactions || !myTransactions.length) {
    return <span className="text-white fs-6 mx-3 family-medium">No ongoing transactions</span>
  }

  return (
    <div className="transaction-list">
      <div className="row">
        <div className="col">
          <h5 className="fw-bold m-0 text-white text-uppercase fs-smallest">Ongoing transactions</h5>
        </div>
      </div>
      {myTransactions.map(renderTransactionRow)}
    </div>
  )
}
