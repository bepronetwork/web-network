import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { toastError } from "contexts/reducers/add-toast";

import { formatStringToCurrency } from "helpers/formatNumber";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";

import InputNumber from "./input-number";

export default function UpdateBountyAmountModal({
  show,
  transactionalAddress,
  handleClose = undefined,
  bountyId,
  repoId,
  ghId
}) {
  const { t } = useTranslation("common");

  const [newAmount, setNewAmount] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { processEvent } = useApi();
  const { updateIssue } = useIssue();
  const transactionalERC20 = useERC20();
  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { dispatch } = useContext(ApplicationContext);
  const { handleApproveToken, handleUpdateBountyAmount } = useBepro();

  const handleChange = params => setNewAmount(params?.value);

  const needsApproval = () => +newAmount > +transactionalERC20.allowance;
  const exceedsBalance = () => +newAmount > +transactionalERC20.balance;

  const resetValues = () => {
    setNewAmount(undefined);
    setIsExecuting(false);
  }

  const handleApprove = async () => {
    setIsExecuting(true);

    handleApproveToken(transactionalAddress, newAmount)
      .then(() => {
        return transactionalERC20.updateAllowanceAndBalance();
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

  useEffect(() => {
    if (!transactionalAddress || !DAOService || !wallet?.address || !show) return;

    transactionalERC20.setAddress(transactionalAddress);
  }, [transactionalAddress, DAOService, wallet, show]);

  return (
    <Modal show={show} onCloseClick={handleClose} title={t("modals.update-bounty-amount.title")} titlePosition="center">
      <div className="container">
        <div className="form-group">
          <InputNumber
            label={t("modals.update-bounty-amount.fields.amount.label")}
            max={transactionalERC20.balance.toString()}
            error={exceedsBalance()}
            value={newAmount}
            min={0}
            onValueChange={handleChange}
            thousandSeparator
            decimalSeparator="."
            decimalScale={transactionalERC20.decimals}
            helperText={
              <>
                {formatStringToCurrency(transactionalERC20.balance.toString())}{" "}
                {transactionalERC20.symbol} Available
              </>
            }
          />
        </div>

        <div className="d-flex pt-2 justify-content-center">
          {needsApproval() ? 
            <Button 
              className="mr-2" 
              onClick={handleApprove} 
              disabled={isExecuting || exceedsBalance()}
              withLockIcon={exceedsBalance()}
              isLoading={isExecuting}
            >
              <span>{t("actions.approve")}</span>
            </Button> :
            <Button
                className="mr-2"
                disabled={isExecuting || exceedsBalance() || !newAmount}
                withLockIcon={exceedsBalance() || !newAmount}
                onClick={handleSubmit}
                isLoading={isExecuting}
            >
              <span>{t("actions.confirm")}</span>
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