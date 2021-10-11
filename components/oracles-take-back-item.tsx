import Modal from './modal';
import {ComponentPropsWithoutRef, useContext, useState} from 'react';
import {BeproService} from 'services/bepro-service';
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';

interface Props extends ComponentPropsWithoutRef<"div"> {
  amount: string;
  address: string;
  onConfirm?(status: boolean): void;
}

export default function OraclesTakeBackItem({
  amount = "",
  address = "",
  onConfirm = () => {},
}: Props): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const {dispatch} = useContext(ApplicationContext);

  function handleShow() {
    setShow(true);
  }

  function handleCancel() {
    setShow(false);
  }

  async function handleTakeBack() {
    const delegateTx = addTransaction({type: TransactionTypes.takeBackOracles, amount: +amount, currency: 'Oracles'});
    dispatch(delegateTx);

    try {

      BeproService.network.unlock({tokenAmount: amount, from: address,})
                  .then(txInfo =>
                          BeproService.parseTransaction(txInfo, delegateTx.payload)
                                      .then((block) => {
                                        dispatch(updateTransaction(block));
                                        onConfirm(txInfo.status);
                                      }))
    } catch (error) {
      console.error("OraclesTakeBackItem handleTakeBack", error);
      dispatch(updateTransaction({...delegateTx as any, remove: true}));
    }
  }

  return (
    <>
      <div className="bg-opac w-100 mb-1 p-3">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="largeCaption text-bold text-purple mb-1 text-uppercase">{amount} ORACLES</p>
            <p className="smallCaption text-white mb-0">{address}</p>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <button className="btn btn-md btn-trans border-purple text-purple" onClick={handleShow}>
              Take Back
            </button>
          </div>
        </div>
      </div>
      <Modal
        show={show}
        title="Take Back"
        onCloseClick={handleCancel}
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary" onClick={handleTakeBack}>
              Confirm
            </button>
          </>
        }>
        <p className="text-center fs-4">
          <span className="me-2">Give away</span>
          <span className="text-bold color-purple me-2">{amount} Oracles</span>
          <span>to get back $BEPRO {amount}</span>
        </p>
      </Modal>
    </>
  );
}
