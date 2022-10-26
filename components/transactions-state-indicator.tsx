import React, { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

import TransactionIcon from "assets/icons/transaction";

import Button from "components/button";
import TransactionModal from "components/transaction-modal";
import TransactionsList from "components/transactions-list";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { Transaction } from "interfaces/transaction";

import {AppStateContext} from "../contexts/app-state";
import {setTxList} from "../contexts/reducers/change-tx-list";
import {WinStorage} from "../services/win-storage";

export default function TransactionsStateIndicator() {
  const {state: { transactions, currentUser: { walletAddress } }, dispatch} = useContext(AppStateContext);

  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  function parseBlock(tx, block) {
    tx.addressFrom = block.from;
    tx.addressTo = block.to;
    tx.transactionHash = block.hash;
    tx.blockHash = block.blockHash;
    tx.confirmations = block.nonce;
    tx.status = block.blockNumber ? TransactionStatus.completed : TransactionStatus.pending;

    return tx;
  }

  function updateLoadingState() {
    if (!transactions.length)
      return;
    const loading = transactions.some(({ status }) => status === TransactionStatus.pending);

    setLoading(loading);
    setShowOverlay(loading);
  }

  function onActiveTransactionChange(transaction: Transaction) {
    setActiveTransaction(transaction);
    setShowOverlay(!!transaction);
  }

  function restoreTransactions() {
    if (!walletAddress)
      return;

    const storage = new WinStorage(`bepro.transaction:${walletAddress}`, 0);
    if (!storage?.value || !storage?.value?.length)
      return;

    const {eth: {getTransaction}} = (window as any).web3;

    Promise.all(storage.value
        .filter(tx => tx.status !== TransactionStatus.rejected && tx.transactionHash)
        .map(tx =>
          getTransaction(tx.transactionHash)
            .then(block => parseBlock(tx, block))))
      .then(txs => dispatch(setTxList(txs)))
  }

  useEffect(updateLoadingState, [transactions]);
  useEffect(restoreTransactions, [walletAddress]);

  const overlay = (
    <Popover id="transactions-indicator">
      <Popover.Body className="bg-shadow p-3">
        <TransactionsList onActiveTransactionChange={onActiveTransactionChange} />
      </Popover.Body>
    </Popover>
  );

  return (
    <span>
      <OverlayTrigger
        trigger="click"
        placement={"bottom-end"}
        show={showOverlay}
        rootClose={true}
        onToggle={(next) => setShowOverlay(next)}
        overlay={overlay}>
        <div>
          <Button
            className="opacity-75 opacity-100-hover"
            transparent
            rounded
            onClick={() => setShowOverlay(!showOverlay)}
          >
            {(loading && (
              <span className="spinner-border spinner-border-sm" />
            )) || <TransactionIcon color="bg-opac" />}
          </Button>
        </div>
      </OverlayTrigger>
      <TransactionModal
        transaction={activeTransaction}
        onCloseClick={() => onActiveTransactionChange(null)}
      />
    </span>
  );
}
