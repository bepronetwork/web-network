import {OverlayTrigger, Popover} from 'react-bootstrap';
import TransactionsList from '@components/transactions-list';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import TransactionIcon from '@assets/icons/transaction';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import TransactionModal from '@components/transaction-modal';
import {Transaction} from '@interfaces/transaction';
import Button from './button';

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
          <div className="me-3">
            <Button className='opacity-75 opacity-100-hover' transparent rounded onClick={() => setShowOverlay(!showOverlay)}>{loading && <span className="spinner-border spinner-border-sm"/> || <TransactionIcon color="bg-opac"/>}</Button>
          </div>
    </OverlayTrigger>
    <TransactionModal transaction={activeTransaction} onCloseClick={() => setActiveTransaction(null)}/>
    </span>
  )
}
