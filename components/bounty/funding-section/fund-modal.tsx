import { useCallback, useEffect, useState } from "react";

import FundingProgress from "components/bounty/funding-section/funding-progress";
import InputWithBalance from "components/input-with-balance";
import Modal from "components/modal";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";


export default function FundModal({
  show = false,
  onCloseClick
}) {
  const [amountToFund, setAmountToFund] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { activeIssue, networkIssue } = useIssue();

  const bountyId = activeIssue?.contractId || networkIssue?.id || "XX";
  
  const SubTitle = 
    <span className="caption-medium text-gray font-weight-normal">
      You are about to fund 
      <span className="text-primary"> Bounty #{bountyId}</span>
    </span>;

  const updateBalance = useCallback(() => {
    if (!wallet?.address || !DAOService) return;

    DAOService.getTokenBalance(networkIssue?.transactionalTokenData?.address, wallet.address)
      .then(setTokenBalance)
      .catch(console.debug);
  }, [wallet?.address, DAOService]);

  useEffect(() => {
    updateBalance();
  }, [DAOService, wallet?.address]);
  
  return(
    <Modal 
      title="Fund Bounty"
      subTitleComponent={SubTitle}
      show={show}
      onCloseClick={onCloseClick}
    >
      <div className="mt-2 px-2 d-grid gap-3">
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
          balance={tokenBalance}
          max={Math.min(networkIssue?.fundingAmount, tokenBalance)}
        />
      </div>
    </Modal>
  );
}