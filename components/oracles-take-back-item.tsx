import ButtonDialog from "components/button-dialog";
import { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<"div"> {
  amount: number;
  address: string;
}

export default function OraclesTakeBackItem({
  amount = 0,
  address = "",
  ...params
}: Props): JSX.Element {
  return (
    <div className="bg-opac w-100 mb-1 p-3" {...params}>
      <div className="row align-items-center">
        <div className="col-md-6">
          <p className="p-small text-bold color-purple mb-1">{amount}</p>
          <p className="p-small mb-0">{address}</p>
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <ButtonDialog
            title="Take Back"
            className="btn-white"
            footer={({ hideModal }) => (
              <>
                <button className="btn btn-md btn-opac" onClick={hideModal}>
                  Cancel
                </button>
                <button className="btn btn-md btn-primary">Confirm</button>
              </>
            )}>
            <p className="text-center fs-4">
              Give away <span className="text-bold color-purple">{amount}</span>{" "}
              Oracles to get back 200,000 $BEPRO
            </p>
          </ButtonDialog>
        </div>
      </div>
    </div>
  );
}
