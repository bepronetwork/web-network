import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { toastError } from "contexts/reducers/add-toast";

import { formatNumberToCurrency } from "helpers/formatNumber";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

export default function UpdateBountyAmountModal({
  show,
  transactionalAddress,
  handleClose = undefined,
  bountyId,
  repoId,
  ghId
}) {
  const { t } = useTranslation("common");
  const { handleApproveToken, handleUpdateBountyAmount } = useBepro();
  const { dispatch } = useContext(ApplicationContext);
  const { updateIssue } = useIssue();
  const { processEvent } = useApi();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { wallet } = useAuthentication();

  const [isExecuting, setIsExecuting] = useState(false);
  const [newAmount, setNewAmount] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [balance, setBalance] = useState(0);

  const handleChange = e => setNewAmount(+e.target.value);

  const needsApproval = () => newAmount > allowance;
  const exceedsBalance = () => newAmount > balance;

  const resetValues = () => {
    setNewAmount(0);
    setAllowance(0);
    setBalance(0);
    setIsExecuting(false);
  }

  const handleApprove = async () => {
    setIsExecuting(true);

    handleApproveToken(transactionalAddress, newAmount)
    .then(() => {
      updateAllowanceAndBalance();
    })
    .catch(error => {
      dispatch(toastError(`Failed to approve:`, error));
    })
    .finally(() => {
      setIsExecuting(false);
    });
  }

  const handleSubmit = async () => {
    setIsExecuting(true);

    handleUpdateBountyAmount(bountyId, newAmount)
    .then(txInfo => {
      return processEvent("bounty", "updated", activeNetwork?.name, { 
        fromBlock: (txInfo as { blockNumber: number }).blockNumber 
      });
    })
    .then(() => {
      updateIssue(repoId, ghId);
      resetValues();
      handleClose();
    })
    .catch(console.log)
    .finally(() => {
      setIsExecuting(false);
    });
  }

  function updateAllowanceAndBalance() {
    DAOService.getAllowance(transactionalAddress, wallet?.address, DAOService.network.contractAddress)
      .then(setAllowance);
      
    DAOService.getTokenBalance(transactionalAddress, wallet?.address).then(setBalance);
  }

  useEffect(() => {
    if (!transactionalAddress || !DAOService || !wallet?.address) return;

    updateAllowanceAndBalance();
  }, [transactionalAddress, DAOService, wallet]);

  return (
    <Modal show={show} onCloseClick={handleClose} title={t("modals.update-bounty-amount.title")} titlePosition="center">
      <div className="container">
        <div className="form-group">
          <label className="caption-small mb-2">{t("modals.update-bounty-amount.fields.amount.label")}</label>

          <input 
            type="text" 
            className={`form-control ${exceedsBalance() && "is-invalid"}`} 
            value={newAmount} 
            onChange={handleChange} 
          />

          <span className={`small-info text-gray ${exceedsBalance() && "text-danger" || "text-gray"}`}>
            Max. {formatNumberToCurrency(balance)}
          </span>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          {needsApproval() ? 
            <Button className="mr-2" onClick={handleApprove} disabled={isExecuting || exceedsBalance()}>
              {(isExecuting || exceedsBalance()) && (
                <LockedIcon />
                )}
              <span>{t("actions.approve")}</span>
              {isExecuting ? (
                <span className="spinner-border spinner-border-xs ml-1" />
                ) : (
                ""
                )}
            </Button> :
            <Button
                className="mr-2"
                disabled={isExecuting || exceedsBalance()}
                onClick={handleSubmit}
            >
                {(isExecuting || exceedsBalance()) && (
                <LockedIcon />
                )}
                <span>{t("actions.confirm")}</span>
                {isExecuting ? (
                <span className="spinner-border spinner-border-xs ml-1" />
                ) : (
                ""
                )}
            </Button>
          }
          <Button color="dark-gray" onClick={handleClose}>
              {t("actions.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}