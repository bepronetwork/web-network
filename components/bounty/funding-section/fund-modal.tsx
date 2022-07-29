import { useContext, useEffect, useState } from "react";

import LockedIcon from "assets/icons/locked-icon";

import FundingProgress from "components/bounty/funding-section/funding-progress";
import Button from "components/button";
import InputWithBalance from "components/input-with-balance";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useIssue } from "contexts/issue";
import { toastError, toastSuccess } from "contexts/reducers/add-toast";

import { formatNumberToCurrency } from "helpers/formatNumber";

import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";

import { Amount, CaptionMedium, RowWithTwoColumns } from "./minimals";

export default function FundModal({
  show = false,
  onCloseClick
}) {
  const [amountToFund, setAmountToFund] = useState(0);
  const [rewardPreview, setRewardPreview] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleFundBounty } = useBepro();
  const { activeIssue, networkIssue, getNetworkIssue } = useIssue();
  const { dispatch } = useContext(ApplicationContext);
  const { allowance, balance, setAddress, approve } = useERC20();

  const bountyId = activeIssue?.contractId || networkIssue?.id || "XX";
  const fundBtnDisabled = 
    isExecuting || !amountToFund || amountToFund + networkIssue?.fundedAmount > networkIssue?.fundingAmount;
  const rewardTokenSymbol = networkIssue?.transactionalTokenData?.symbol;
  const needsApproval = amountToFund > allowance;
  const amountNotFunded = (networkIssue?.fundingAmount || 0) - (networkIssue?.fundedAmount || 0);

  const ConfirmBtn = {
    label: needsApproval ? "Approve" : "Fund Bounty",
    action: needsApproval ? handleApprove : fundBounty
  }
  
  const SubTitle = 
    <span className="caption-medium text-gray font-weight-normal">
      You are about to fund 
      <span className="text-primary"> Bounty #{bountyId}</span>
    </span>;

  function fundBounty() {
    if (!networkIssue?.id || !amountToFund) return;

    setIsExecuting(true);

    handleFundBounty(networkIssue.id, amountToFund)
      .then(() => {
        const amountFormatted = formatNumberToCurrency(amountToFund);

        onCloseClick();
        getNetworkIssue();
        dispatch(toastSuccess(`Funded ${amountFormatted} $${rewardTokenSymbol}`, "Bounty funded successfully"));
      })
      .catch(error => {
        console.debug("Failed to fund bounty", error);
        dispatch(toastError("Something went wrong. Try again later.", "Failed to fund bounty"));
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
      title="Fund Bounty"
      subTitleComponent={SubTitle}
      show={show}
      onCloseClick={onCloseClick}
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
          label="Fund Amount"
          value={amountToFund}
          onChange={setAmountToFund}
          symbol={networkIssue?.transactionalTokenData?.symbol}
          balance={balance}
          max={Math.min(amountNotFunded, balance)}
        />

        <RowWithTwoColumns
          col1={ <CaptionMedium text="Reward" color="white" /> }
          col2={
            <div className="bg-dark-gray border-radius-8 py-2 px-3">
              +<Amount
                amount={rewardPreview}
                symbol={rewardTokenSymbol}
                symbolColor="warning"
                className="caption-large text-white font-weight-normal"
              />
            </div>
          }
        />

        <RowWithTwoColumns
          col1={
            <Button 
              color="gray" 
              outline
              onClick={onCloseClick}
            >
              Cancel
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