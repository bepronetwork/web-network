import React, {useContext, useEffect, useState} from 'react';
import Modal from '@components/modal';
import TransactionStats from '@components/transaction-stats';
import CopyIcon from '@assets/icons/copy';
import {BlockTransaction, Transaction} from '@interfaces/transaction';
import ArrowRight from '@assets/icons/arrow-right';
import {formatNumberToString} from '@helpers/formatNumber';
import {CopyValue} from '@helpers/copy-value';
import {ApplicationContext} from '@contexts/application';
import {toastInfo} from '@reducers/add-toast';
import { format } from 'date-fns';
import Button from './button';
import LinkIcon from '@assets/icons/link-icon';
import { truncateAddress } from '@helpers/truncate-address';
import { useTranslation } from 'next-i18next';
import InternalLink from './internal-link';
import useNetworkTheme from '@x-hooks/use-network';
import { BEPRO_NETWORK_NAME } from 'env';

export default function TransactionModal({ transaction = null, onCloseClick = () => {}}: { transaction: Transaction, onCloseClick: () => void }) {
  const {dispatch} = useContext(ApplicationContext);
  const [addressFrom, setAddressFrom] = useState(`...`);
  const [addressTo, setAddressTo] = useState(`...`);
  const [details, setDetails] = useState<any>([]);
  const { t } = useTranslation('common')
  const { getURLWithNetwork } = useNetworkTheme()

  function updateAddresses() {
    if (!transaction)
      return;

    const blockTransaction = transaction as BlockTransaction;

    setAddressFrom(truncateAddress(blockTransaction?.addressFrom, 12, 3, '...'));
    setAddressTo(truncateAddress(blockTransaction?.addressTo, 12, 3, '...'));

    const makeDetail = (span, content) => ({span, content})
    setDetails(
      [
        makeDetail(t('transactions.amount'), <><span>{formatNumberToString(blockTransaction.amount)}</span> <span className={`${blockTransaction.currency.toLowerCase() === 'oralces' ? 'text-purple' : 'text-primary'}`}>{blockTransaction.currency}</span> </>),
        makeDetail(t('transactions.confirmations'), [blockTransaction.confirmations, 23].join(`/`)),
        makeDetail(t('transactions.date'), format(new Date(blockTransaction.date), "MMMM dd yyyy hh:mm:ss a")),
      ]
    )
  }

  useEffect(updateAddresses, [transaction]);

  function renderDetailRow(item): any {
    return <>
      <div className="d-flex align-items-center justify-content-between bg-dark-gray py-2 mt-2 px-3 rounded-8">
        <span className="caption-small text-white-50">{item.span}</span>
        <span className="caption-medium text-white">{item.content}</span>
      </div>
    </>
  }

  function copyValue(value: string) {
    CopyValue(value);
    dispatch(toastInfo(t('transactions.copied', { value })));
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
    title={t('transactions.modal')}
    show={!!transaction}
    onCloseClick={onCloseClick}
    titlePosition="center"
    titleClass="h3 text-white bg-opacity-100 fs-2"
    >
      <span className="d-block caption-small text-white-50 text-uppercase">{t('misc.status')}</span>
      <div className="d-flex justify-content-between align-items-center py-2">
        <TransactionStats status={transaction?.status} />

        <div className="d-flex">
           {hasTransactionId() &&
                <Button onClick={() => copyValue(getTransactionId())} className="border-dark-gray mr-1 hover-blue" applyTextColor={false} transparent rounded><CopyIcon /></Button>
          || ``}
          <a href={getEtherScanHref(getTransactionId())} className='text-decoration-none' target="_blank">
            <Button className="border-dark-gray mr-1 hover-blue" applyTextColor={false} transparent rounded><LinkIcon /></Button>
          </a>
        </div>
      </div>

      <div className="caption-small d-flex flex-row mb-3">
        <span className="text-ligth-gray">{t('misc.on')}</span> 
        <InternalLink className={`${transaction?.network?.name === BEPRO_NETWORK_NAME ? ' text-primary ' : ''} p-0 ml-1`} label={transaction?.network?.name} href={getURLWithNetwork('/', {network: transaction?.network?.name})} style={{color: `${transaction?.network?.colors?.primary}`}} brand transparent />
      </div>

      <div className="d-flex py-2 mb-3 caption-small text-white bg-opacity-100">
        <span>{t('misc.from')}: {addressFrom}</span>
        <div className="mx-auto"><ArrowRight/></div>
        <span>{t('misc.to')}: {addressTo}</span>
      </div>
      {details.map(renderDetailRow)}
    </Modal>
  </>
}
