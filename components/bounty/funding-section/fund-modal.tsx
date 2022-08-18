import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import LockedIcon from "assets/icons/locked-icon";

import FundingProgress from "components/bounty/funding-section/funding-progress";
import Button from "components/button";
import InputWithBalance from "components/input-with-balance";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { toastError, toastSuccess } from "contexts/reducers/add-toast";

import { formatNumberToCurrency } from "helpers/formatNumber";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";

import { Amount, CaptionMedium, RowWithTwoColumns } from "./minimals";

export default function FundModal({
  show = false,
  onCloseClick,
}) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  const [amountToFund, setAmountToFund] = useState(0);
  const [rewardPreview, setRewardPreview] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const {
    query: { repoId }
  } = useRouter();
  const { handleFundBounty } = useBepro();
  const { dispatch } = useContext(ApplicationContext);
  const { processEvent } = useApi();
  const { activeNetwork } = useNetwork();
  const { activeIssue, networkIssue, getNetworkIssue, updateIssue } = useIssue();
  const { allowance, balance, setAddress, approve, updateAllowanceAndBalance } = useERC20();

  const bountyId = activeIssue?.contractId || networkIssue?.id || "XX";
  const fundBtnDisabled = 
    isExecuting || !amountToFund || amountToFund + networkIssue?.fundedAmount > networkIssue?.fundingAmount;
  const rewardTokenSymbol = networkIssue?.rewardTokenData?.symbol;
  const needsApproval = amountToFund > allowance;
  const amountNotFunded = (networkIssue?.fundingAmount || 0) - (networkIssue?.fundedAmount || 0);

  const ConfirmBtn = {
    label: needsApproval ? t("actions.approve") : t("funding:actions.fund-bounty"),
    action: needsApproval ? handleApprove : fundBounty
  }
  
  const SubTitle = 
    <span className="caption-medium text-gray font-weight-normal">
      {t("funding:modals.fund.description")}
      <span className="text-primary text-capitalize"> {t("bounty:label")} #{bountyId}</span>
    </span>;

  function setDefaults() {
    setAmountToFund(0);
    setRewardPreview(0);
    updateAllowanceAndBalance();
  }

  function handleClose() {
    setDefaults();
    onCloseClick();
  }

  function fundBounty() {
    if (!networkIssue?.id || !amountToFund) return;

    setIsExecuting(true);

    handleFundBounty(networkIssue.id, amountToFund)
      .then(async (txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        
        await processEvent("bounty", "funded", activeNetwork?.name, { 
          fromBlock
        })
      })
      .then(() => {
        const amountFormatted = formatNumberToCurrency(amountToFund);
        updateIssue(repoId.toString(), activeIssue?.githubId)
        handleClose();
        getNetworkIssue();
        dispatch(toastSuccess(t("funding:modals.fund.funded-x-symbol", {
          amount: amountFormatted,
          symbol: rewardTokenSymbol
        }), t("funding:modals.fund.funded-succesfully")));
      })
      .catch(error => {
        console.debug("Failed to fund bounty", error);
        dispatch(toastError(t("funding:try-again"), t("funding:modals.fund.failed-to-fund")));
      })
      .finally(() => setIsExecuting(false));
  }

  function handleApprove() {
    setIsExecuting(true);
    approve(amountToFund)
      .catch(console.debug)
      .finally(() => setIsExecuting(false));
  }

  useEffect(() => {
    if (!networkIssue?.fundingAmount || !networkIssue?.rewardAmount) return;

    if (amountToFund <= amountNotFunded)
      setRewardPreview((amountToFund || 0) / networkIssue.fundingAmount * networkIssue.rewardAmount);
    else
      setRewardPreview(0);
  }, [networkIssue?.fundingAmount, networkIssue?.rewardAmount, amountToFund]);

  useEffect(() => {
    if (networkIssue?.transactionalTokenData?.address) 
      setAddress(networkIssue?.transactionalTokenData?.address);
  }, [networkIssue?.transactionalTokenData?.address]);
  
  return(
    <Modal 
      title={t("funding:modals.fund.title")}
      subTitleComponent={SubTitle}
      show={show}
      onCloseClick={handleClose}
    >
      <div className="mt-2 px-2 d-grid gap-4">
        <FundingProgress
          fundedAmount={networkIssue?.fundedAmount}
          fundingAmount={networkIssue?.fundingAmount}
          fundingTokenSymbol={networkIssue?.transactionalTokenData?.symbol}
          fundedPercent={networkIssue?.fundedPercent}
          amountToFund={amountToFund}
        />

        <InputWithBalance
          label={t("funding:modals.fund.fields.fund-amount.label")}
          value={amountToFund}
          onChange={setAmountToFund}
          symbol={networkIssue?.transactionalTokenData?.symbol}
          balance={balance}
          max={Math.min(amountNotFunded, balance)}
        />

        {networkIssue?.rewardAmount > 0 && (
                  <RowWithTwoColumns
                    col1={<CaptionMedium text={t("funding:reward")} color="white" />}
                    col2={
                      <div className="bg-dark-gray border-radius-8 py-2 px-3">
                        +
                        <Amount
                          amount={rewardPreview}
                          symbol={rewardTokenSymbol}
                          symbolColor="warning"
                          className="caption-large text-white font-weight-normal"
                        />
                      </div>
                    }
                  />
                )}

        <RowWithTwoColumns
          col1={
            <Button 
              color="gray" 
              outline
              onClick={handleClose}
            >
              {t("actions.cancel")}
            </Button>
          }
          col2={
            <Button
              disabled={fundBtnDisabled}
              onClick={ConfirmBtn.action}
            >
              {(fundBtnDisabled && !isExecuting) && <LockedIcon className="me-2" />}
              <span>{ConfirmBtn.label}</span>
              { isExecuting && <span className="spinner-border spinner-border-xs ml-1" /> }
            </Button>
          }
        />
      </div>
    </Modal>
  );
}