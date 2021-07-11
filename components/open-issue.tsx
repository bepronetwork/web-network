import ButtonDialog from "./button-dialog";

export default function OpenIssue(): JSX.Element {
  return (
    <ButtonDialog
      title="Open issue"
      footer={({ hideModal }) => (
        <>
          <button className="btn btn-md btn-opac" onClick={hideModal}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary">Open Issue</button>
        </>
      )}>
      <p className="p-small text-white-50 text-center">Are you sure?</p>
      <p className="text-center fs-6 text fw-bold">
        Remove all getContract functions from Application and instead calling
        the Object directly
      </p>
      <div className="px-3 py-2 d-flex flex-column btn-opac rounded-3 align-items-center">
        <span className="p-small text-white-50">Reward</span>
        <span className="text fw-bold">200K $BEPRO</span>
      </div>
    </ButtonDialog>
  );
}
