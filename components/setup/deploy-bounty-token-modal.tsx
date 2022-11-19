import { useState } from "react";
import { Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("setup");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const { dispatch } = useAppState();
  const { handleDeployBountyToken } = useBepro();

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
      dispatch(toastSuccess(t("modals.deploy-bounty-token.success.deploy")));
    } catch (error) {
      if (error?.code !== MetamaskErrors.UserRejected)
        dispatch(toastError(t("modals.deploy-bounty-token.errors.deploy")));
    } finally {
      setIsExecuting(false);
    }
  }

  return(
    <Modal
      show={show}
      onCloseClick={handleClose}
      title={t("modals.deploy-bounty-token.title")}
    >
      <Row className="mb-3">
        <FormGroup
          label={t("modals.deploy-bounty-token.fields.name.label")}
          placeholder={t("modals.deploy-bounty-token.fields.name.placeholder")}
          value={name}
          onChange={setName}
        />

        <FormGroup
          label={t("modals.deploy-bounty-token.fields.symbol.label")}
          placeholder={t("modals.deploy-bounty-token.fields.symbol.placeholder")}
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
        <span>{t("modals.deploy-bounty-token.actions.deploy")}</span>
      </Button>
    </Modal>
  );
}