import { useState } from "react";
import { Row } from "react-bootstrap";

import Button from "components/button";
import { FormGroup } from "components/form-group";
import Modal from "components/modal";

import { useAppState } from "contexts/app-state";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import { MetamaskErrors } from "interfaces/enums/Errors";

import useBepro from "x-hooks/use-bepro";

export function DeployBountyTokenModal({
  show = false,
  handleHide,
  onChange
}) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleDeployBountyToken } = useBepro();
  const { dispatch } = useAppState();

  const deployBtnDisabled = name.trim() === "" || symbol.trim() === "";

  function handleClose() {
    setName("");
    setSymbol("");
    handleHide();
  }

  async function deployContract() {    
    try {
      setIsExecuting(true);

      const tx = await handleDeployBountyToken(name, symbol);

      onChange(tx.contractAddress);
      handleClose();
      dispatch(toastSuccess("Bounty Token deployed"));
    } catch (error) {
      if (error?.code !== MetamaskErrors.UserRejected)
        dispatch(toastError("Failed to deploy Bounty Token"));
    } finally {
      setIsExecuting(false);
    }
  }

  return(
    <Modal
      show={show}
      onCloseClick={handleClose}
      title="New Bounty Token"
    >
      <Row className="mb-3">
        <FormGroup
          label="Name"
          placeholder="Token Name"
          value={name}
          onChange={setName}
        />

        <FormGroup
          label="Symbol"
          placeholder="Token Symbol"
          value={symbol}
          onChange={setSymbol}
        />
      </Row>

      <Button
        onClick={deployContract}
        isLoading={isExecuting}
        withLockIcon={deployBtnDisabled}
        disabled={deployBtnDisabled || isExecuting}
      >
        <span>Deploy</span>
      </Button>
    </Modal>
  );
}