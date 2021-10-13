import {BeproService} from '@services/bepro-service';
import {forwardRef, useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import Modal from './modal';
import Icon from './icon';
import {addTransaction} from '@reducers/add-transaction'
import {addToast} from '@reducers/add-toast';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {TransactionCurrency} from '@interfaces/transaction';
import {updateTransaction} from '@reducers/update-transaction';
import LockIcon from '@assets/icons/lock';
import Button from './button';

interface NetworkTxButtonParams {
  txMethod: string;
  txParams: any;
  onTxStart?: () => void;
  onSuccess: () => void;
  onFail: (message?: string) => void;
  modalTitle: string;
  modalDescription: string;
  buttonLabel?: string;
  children?: JSX.Element;
  disabled?: boolean;
  txType: TransactionTypes;
  txCurrency: TransactionCurrency;
  fullWidth?: boolean;
}


function networkTxButton({
                           txMethod,
                           txParams,
                           onTxStart = () => {},
                           onSuccess,
                           onFail,
                           buttonLabel,
                           modalTitle,
                           modalDescription,
                           children = null, fullWidth = false,
                           disabled = false, txType = TransactionTypes.unknown, txCurrency = `$BEPRO`,
                         }: NetworkTxButtonParams, elementRef) {
  const {dispatch, state: {beproInit, metaMaskWallet}} = useContext(ApplicationContext);
  const [showModal, setShowModal] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  function checkForTxMethod() {
    if (!beproInit || !metaMaskWallet)
      return;

    if (!txMethod || typeof BeproService.network[txMethod] !== `function`)
      throw new Error(`Wrong txMethod`);
  }

  function makeTx() {
    if (!beproInit || !metaMaskWallet)
      return;

    const tmpTransaction = addTransaction({type: txType, amount: txParams?.tokenAmount || 0, currency: txCurrency});
    dispatch(tmpTransaction);
    BeproService.network[txMethod](txParams)
      .then((answer) => {
        if (answer.status) {
          onSuccess && onSuccess();
          dispatch(addToast({
                              type: 'success',
                              title: 'Success',
                              content: `${txMethod} ${txParams?.tokenAmount} ${txCurrency}`
                            }));

          BeproService.parseTransaction(answer, tmpTransaction.payload)
                      .then(info => {
                        dispatch(updateTransaction(info))
                      })

        } else {
          onFail(answer.message)
          dispatch(addToast({type: 'danger', title: 'Failed'}));
          dispatch(updateTransaction({...tmpTransaction.payload as any, remove: true}));
        }
      })
      .catch(e => {
        onFail(e.message);
        dispatch(updateTransaction({...tmpTransaction.payload as any, remove: true}));
        console.error(e);
      })

  }

  function getButtonClass() {
    return `mt-3 ${fullWidth ? `w-100` : ``} ${!children && !buttonLabel && `visually-hidden` || ``}`
  }

  function getDivClass() {
    return `d-flex flex-column align-items-center text-${txSuccess ? `success` : `danger`}`;
  }

  const modalFooter = (<Button color='dark-gray' onClick={() => setShowModal(false)}>Close</Button>)

  useEffect(checkForTxMethod, [beproInit, metaMaskWallet])

  return (<>
    <button className='d-none' ref={elementRef} onClick={makeTx} disabled={disabled}/>

    <Button color='purple' className={getButtonClass()} onClick={makeTx} disabled={disabled}>
      {disabled && <LockIcon width={12} height={12} className="mr-1"/>} {buttonLabel}
    </Button>

    <Modal show={showModal} title={modalTitle} footer={modalFooter}>
      <p className="p-small text-white-50 text-center">{modalDescription}</p>
      <div className={getDivClass()}>
        <Icon className="md-larger">{txSuccess ? `check_circle` : `error`}</Icon>
        <p className="text-center fs-4 mb-0 mt-2">
          Transaction {txSuccess ? `completed` : `failed`}
        </p>
      </div>
    </Modal>
  </>)
}

const NetworkTxButton = forwardRef(networkTxButton);

export default NetworkTxButton;
