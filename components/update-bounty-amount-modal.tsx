import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import InputNumber from "components/input-number";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {toastError} from "contexts/reducers/change-toaster";

import {formatStringToCurrency} from "helpers/formatNumber";

import { NetworkEvents } from "interfaces/enums/events";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";

export default function UpdateBountyAmountModal({
  show,
  transactionalAddress,
  handleClose = undefined,
  bountyId,
  updateBountyData
}) {
  const { t } = useTranslation("common");

  const [isExecuting, setIsExecuting] = useState(false);
  const [newAmount, setNewAmount] = useState<BigNumber>();

  const { state, dispatch } = useAppState();

  const { processEvent } = useApi();
  const transactionalERC20 = useERC20();

  const { handleApproveToken, handleUpdateBountyAmount } = useBepro();
  
  const handleChange = params => setNewAmount(BigNumber(params.value));

  const needsApproval = !!newAmount?.gt(transactionalERC20.allowance);
  const exceedsBalance = !!newAmount?.gt(transactionalERC20.balance);

  const resetValues = () => {
    setNewAmount(undefined);
    setIsExecuting(false);
  }

  const handleApprove = async () => {
    setIsExecuting(true);

    handleApproveToken(transactionalAddress, newAmount.toFixed(), undefined, transactionalERC20?.symbol)
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

    handleUpdateBountyAmount(bountyId, newAmount.toFixed(), transactionalERC20?.symbol)
      .then(txInfo => {
        return processEvent(NetworkEvents.BountyUpdated, undefined, {
          fromBlock: (txInfo as { blockNumber: number }).blockNumber 
        });
      })
      .then(() => {
        updateBountyData();
        resetValues();
        handleClose();
      })
      .catch(console.log)
      .finally(() => {
        setIsExecuting(false);
      });
  }

  useEffect(() => {
    if (!transactionalAddress || !state.Service?.active || !state.currentUser?.walletAddress || !show) return;

    transactionalERC20.setAddress(transactionalAddress);
  }, [transactionalAddress, state.Service?.active, state.currentUser, show]);

  return (
    <Modal 
      show={show} 
      onCloseClick={handleClose} 
      title={t("modals.update-bounty-amount.title")} 
      titlePosition="center"
      footer={(
        <div className="d-flex pt-2 justify-content-between">
          <Button color="dark-gray" onClick={handleClose}>
              {t("actions.cancel")}
          </Button>
          {needsApproval ? 
            <Button 
              onClick={handleApprove} 
              disabled={isExecuting || exceedsBalance}
              withLockIcon={exceedsBalance}
              isLoading={isExecuting}
            >
              <span>{t("actions.approve")}</span>
            </Button> :
            <ContractButton
                disabled={isExecuting || exceedsBalance || !newAmount}
                withLockIcon={exceedsBalance || !newAmount}
                onClick={handleSubmit}
                isLoading={isExecuting}
            >
              <span>{t("actions.confirm")}</span>
            </ContractButton>
          }
        </div>
      )}
      >
      <div className="container">
        <div className="form-group">
          <InputNumber
            label={t("modals.update-bounty-amount.fields.amount.label")}
            max={transactionalERC20.balance.toFixed()}
            error={exceedsBalance}
            value={newAmount?.toFixed()}
            min={0}
            onValueChange={handleChange}
            thousandSeparator
            decimalSeparator="."
            decimalScale={transactionalERC20.decimals}
            helperText={
              <>
                {formatStringToCurrency(transactionalERC20.balance.toFixed())}{" "}
                {transactionalERC20.symbol} Available
              </>
            }
          />
        </div>
      </div>
    </Modal>
  );
}