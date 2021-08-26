import Modal from "./modal";
import {ComponentPropsWithoutRef, useContext, useState} from 'react';
import {BeproService} from "services/bepro-service";
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';

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
    try {
      dispatch(changeLoadState(true));

      const response = await BeproService.network.unlock({
        tokenAmount: amount,
        from: address,
      });

      onConfirm(response.status);
      dispatch(changeLoadState(false));
    } catch (error) {
      console.error("OraclesTakeBackItem handleTakeBack", error);
      dispatch(changeLoadState(false));
    }
  }

  return (
    <>
      <div className="bg-opac w-100 mb-1 p-3">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="p-small text-bold color-purple mb-1">{amount}</p>
            <p className="p-small mb-0">{address}</p>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <button className="btn btn-md btn-white" onClick={handleShow}>
              Take Back
            </button>
          </div>
        </div>
      </div>
      <Modal
        show={show}
        title="Take Back"
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
          Give away{" "}
          <span className="text-bold color-purple">{amount} Oracles</span> to
          get back $BEPRO 200,000
        </p>
      </Modal>
    </>
  );
}
