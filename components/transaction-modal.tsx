import React, {useContext, useEffect, useState} from 'react';
import Modal from '@components/modal';
import TransactionStats from '@components/transaction-stats';
import CopyIcon from '@assets/icons/copy';
import ArrowGoTo from '@assets/icons/arrow-goto';
import {BlockTransaction, Transaction} from '@interfaces/transaction';
import ArrowRightSmall from '@assets/icons/arrow-ritght-small';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import {formatNumberToString} from '@helpers/formatNumber';
import {CopyValue} from '@helpers/copy-value';
import {ApplicationContext} from '@contexts/application';
import {toastInfo} from '@reducers/add-toast';
import { format } from 'date-fns';
import Button from './button';

export default function TransactionModal({ transaction = null, onCloseClick = () => {}}: { transaction: Transaction, onCloseClick: () => void }) {
  const {dispatch, state: {network}} = useContext(ApplicationContext);
  const [addressFrom, setAddressFrom] = useState(`...`);
  const [addressTo, setAddressTo] = useState(`...`);
  const [details, setDetails] = useState<any>([]);

  function updateAddresses() {
    if (!transaction || transaction.status === TransactionStatus.pending)
      return;

    const blockTransaction = transaction as BlockTransaction;

    setAddressFrom(blockTransaction.addressFrom.substr(0, 15).concat(`...`));
    setAddressTo(blockTransaction.addressTo.substr(0, 15).concat(`...`));

    const makeDetail = (span, content) => ({span, content})
    setDetails(
      [
        makeDetail(`Amount`, [formatNumberToString(blockTransaction.amount), blockTransaction.currency].join(` `)),
        makeDetail(`Confirmations`, [blockTransaction.confirmations, 23].join(`/`).concat(` Confirmations`)),
        makeDetail(`Date`, format(new Date(blockTransaction.date), "MMMM dd yyyy hh:mm:ss a")),
      ]
    )
  }

  useEffect(updateAddresses, [transaction]);

  function renderDetailRow(item): any {
    return <>
      <div className="d-flex align-items-center justify-content-between bg-dark-gray py-3 mt-2 px-3 rounded">
        <span className="smallCaption text-white-50 fs-smallest text-uppercase">{item.span}</span>
        <span className=".p text-white fs-small">{item.content}</span>
      </div>
    </>
  }

  function copyValue(value: string) {
    CopyValue(value);
    dispatch(toastInfo(`Copied ${value}`));
  }

  function getTransactionId() {
    return (transaction as BlockTransaction)?.transactionHash;
  }

  function hasTransactionId() {
    return transaction && !!(transaction as BlockTransaction).transactionHash;
  }

  function getEtherScanHref(tx: string) {
    return `//${process.env.NEXT_PUBLIC_BLOCKSCAN_LINK}/tx/${tx}`
  }

  return <>
    <Modal
    id="transaction-modal"
    title="Transaction Details"
    show={!!transaction}
    onCloseClick={onCloseClick}
    titlePosition="center"
    titleClass="h3 text-white bg-opacity-100 fs-2"
    >
      <span className="d-block smallCaption text-white-50 text-uppercase">Status</span>
      <div className="d-flex justify-content-between align-items-center py-2 mb-3">
        <TransactionStats status={transaction?.status} />
        <div className="d-flex">
           {hasTransactionId() &&
                <Button onClick={() => copyValue(getTransactionId())} className="border-dark-gray mr-1" transparent rounded><CopyIcon height={14} width={14} color="white"/></Button>
          || ``}
          <a href={getEtherScanHref(getTransactionId())} className='text-decoration-none' target="_blank">
            <Button className="border-dark-gray mr-1" transparent rounded><ArrowGoTo color="white"/></Button>
          </a>
        </div>
      </div>
      <div className="d-flex py-2 mb-1 smallCaption text-white bg-opacity-100 fs-smallest">
        <span>From: {addressFrom}</span>
        <div className="mx-auto"><ArrowRightSmall/></div>
        <span>To: {addressTo}</span>
      </div>
      {details.map(renderDetailRow)}
    </Modal>
  </>
}
