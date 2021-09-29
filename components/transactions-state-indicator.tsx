import {OverlayTrigger, Popover} from 'react-bootstrap';
import TransactionsList from '@components/transactions-list';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import TransactionIcon from '@assets/icons/transaction';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import TransactionModal from '@components/transaction-modal';
import {Transaction} from '@interfaces/transaction';

export default function TransactionsStateIndicator() {
  const {state: {myTransactions}} = useContext(ApplicationContext);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null)

  function updateLoadingState() {
    const loading = myTransactions.some(({status}) => status !== TransactionStatus.completed)
    setLoading(loading);
    setShowOverlay(loading);
  }

  function onActiveTransactionChange(transaction) {
    setActiveTransaction(transaction);
  }

  const overlay = (
    <Popover id="transactions-indicator">
      <Popover.Body className="bg-shadow">
        <TransactionsList onActiveTransaction={onActiveTransactionChange}/>
      </Popover.Body>
    </Popover>
  )

  useEffect(updateLoadingState, [myTransactions])

  return (
    <span>
      <OverlayTrigger
        trigger="click"
        placement={'bottom-end'}
        show={showOverlay}
        rootClose={true}
        onToggle={(next) => setShowOverlay(next)}
        overlay={overlay}>
        <button className={`btn btn-md circle-2 btn-${showOverlay ? `opac` : `trans`} p-0 me-3 me-3`} onClick={() => setShowOverlay(!showOverlay)}>
          {loading && <span className="spinner-border spinner-border-sm"/> || <TransactionIcon/>}
        </button>
    </OverlayTrigger>
    <TransactionModal transaction={activeTransaction} onCloseClick={() => setActiveTransaction(null)}/>
    </span>
  )
}
