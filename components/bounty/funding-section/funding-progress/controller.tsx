import BigNumber from "bignumber.js";

import FundingProgressView from "./view";

interface FundingProgressProps {
  fundedAmount: string;
  fundingAmount: string;
  fundedPercent: string;
  fundingTokenSymbol: string;
  amountToFund?: string;
}

export default function FundingProgress({
  fundedAmount,
  fundingAmount,
  fundedPercent,
  fundingTokenSymbol,
  amountToFund = "0",
}: FundingProgressProps) {
  const fundingPercent = BigNumber(BigNumber(amountToFund).multipliedBy(100).toFixed(2, 1)).dividedBy(fundingAmount);
  const maxPercent = BigNumber(100).minus(fundedPercent);
  const totalPercent = fundingPercent.plus(fundedPercent);
  const isFundingModal = BigNumber(amountToFund).gt(0);
  const contextClass = totalPercent.lt(100)
    ? "primary"
    : totalPercent.isEqualTo(100)
    ? "success"
    : "danger";
  const secondaryProgressVariant = totalPercent.lt(100)
    ? "blue-dark"
    : totalPercent.isEqualTo(100)
    ? "success-50"
    : "danger-50";
  const fundPreview = BigNumber(fundedAmount).plus(amountToFund).toFixed();

  return (
    <FundingProgressView
      fundedAmount={fundedAmount}
      fundingAmount={fundingAmount}
      fundedPercent={fundedPercent}
      fundingTokenSymbol={fundingTokenSymbol}
      isFundingModal={isFundingModal}
      contextClass={contextClass}
      fundPreview={fundPreview}
      secondaryProgressVariant={secondaryProgressVariant}
      fundingPercent={fundingPercent}
      totalPercent={totalPercent}
      maxPercent={maxPercent}
    />
  );
}
