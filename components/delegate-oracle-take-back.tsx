import ButtonDialog from "./button-dialog";

export default function DelegateOrableTakeBack({
  amount = 0,
}: {
  amount: number;
}): JSX.Element {
  return (
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
  );
}
