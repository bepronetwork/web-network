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

export default function TransactionModal({transaction = null, onCloseClick = () => {}}: { transaction: Transaction, onCloseClick: () => void }) {
  const {dispatch, state: {network}} = useContext(ApplicationContext);
  const [addressFrom, setAddressFrom] = useState(`...`);
  const [addressTo, setAddressTo] = useState(`...`);
  const [details, setDetails] = useState<any>([]);

  function updateAddresses() {
    if (!transaction || transaction.status === TransactionStatus.pending)
      return;

    const blockTransaction = transaction as BlockTransaction;

    setAddressFrom(blockTransaction.addressFrom.substr(0, 7).concat(`...`));
    setAddressTo(blockTransaction.addressTo.substr(0, 7).concat(`...`));

    const makeDetail = (span, content) => ({span, content})
    setDetails(
      [
        makeDetail(`Amount`, [formatNumberToString(blockTransaction.amount), blockTransaction.currency].join(` `)),
        makeDetail(`Confirmations`, [blockTransaction.confirmations, 23].join(`/`).concat(` Confirmations`)),
        makeDetail(`Date`, blockTransaction.date),
      ]
    )
  }

  useEffect(updateAddresses, [transaction]);

  function renderDetailRow(item): any {
    return <>
      <div className="d-flex align-items-center justify-content-between bg-black py-3 mt-2 px-3 rounded">
        <span className="text-white-50 fs-small">{item.span}</span>
        <span className="text-white">{item.content}</span>
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
    return `//${network === `ethereum` && `` || `${network}.`}etherscan.io/tx/${tx}`
  }

  return <>
    <Modal title="Details" show={!!transaction} onCloseClick={onCloseClick}>
      <span className="d-block text-white-50">Status</span>
      <div className="d-flex justify-content-between align-items-center py-2 mb-3">
        <TransactionStats status={transaction?.status} />
        <div>
          { hasTransactionId() && <a onClick={() => copyValue(getTransactionId())} className="rounded border-0 px-1 bg-dark me-2 cursor-pointer"><CopyIcon/></a> || ``}
          <a href={getEtherScanHref(getTransactionId())} target="_blank" className="rounded border-0 px-1 bg-dark"><ArrowGoTo/></a>
        </div>
      </div>
      <div className="d-flex py-2 mb-1">
        <div>From {addressFrom}</div>
        <div className="mx-auto"><ArrowRightSmall/></div>
        <div>To {addressTo}</div>
      </div>
      {details.map(renderDetailRow)}
    </Modal>
  </>
}
