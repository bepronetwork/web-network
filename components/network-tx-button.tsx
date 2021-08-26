import { Network } from 'bepro-js';
import {BeproService} from '../services/bepro-service';
import {forwardRef, useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '../contexts/application';
import {changeLoadState} from '../contexts/reducers/change-load-state';
import Modal from './modal';
import Icon from "./icon";
import {addToast} from '../contexts/reducers/add-toast';
import {addTransactions} from 'contexts/reducers/add-transactions'

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
}


function networkTxButton({txMethod, txParams, onTxStart = () => {}, onSuccess, onFail, buttonLabel, modalTitle, modalDescription, children = null, disabled = false}: NetworkTxButtonParams, elementRef) {
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

    dispatch(changeLoadState(true));

    BeproService.network[txMethod](txParams)
      .then(async({transactionHash, status, message, ...rest}) => {
        debugger;
        
        if (status) {
          onSuccess()
          dispatch(addToast({content: `Success!`, title: txMethod}));
          const transactionsInfo = await BeproService.getTransaction(transactionHash)
          dispatch(addTransactions({
            ...transactionsInfo,
            type: `${txMethod}`,
            amount: `${txParams.tokenAmount}`,
            amountType: 'Oracles',
            status: transactionsInfo.status,
            date: new Date(),
          }))
        } else {
          onFail(message)
          dispatch(addToast({content: message, title: txMethod}));
        }

        setTxSuccess(status);
      })
      .catch(e => {
        onFail(e.message);
        console.error(e);
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      });
  }

  function getButtonClass() {
    return `btn btn-md btn-lg w-100 mt-3 btn-primary ${!children && !buttonLabel && `visually-hidden` || ``}`
  }

  function getDivClass() {
    return `d-flex flex-column align-items-center text-${txSuccess ? `success` : `danger`}`;
  }

  const modalFooter = (<button className="btn btn-md btn-opac" onClick={() => setShowModal(false)}>Close</button>)

  useEffect(checkForTxMethod, [beproInit, metaMaskWallet])

  return (<>
    <button ref={elementRef} className={getButtonClass()} onClick={makeTx} disabled={disabled}>
      {buttonLabel}
    </button>

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
