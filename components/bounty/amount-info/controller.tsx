import BigNumber from "bignumber.js";

import { IssueBigNumberData } from "interfaces/issue-data";

import BountyAmountView from "./view";

export default function BountyAmount({
  bounty,
  size = "lg",
}: {
  bounty: IssueBigNumberData;
  size: "sm" | "lg";
}) {
  const isFundingRequest = !!bounty?.fundingAmount?.gt(0);
  const bountyAmount =
    (isFundingRequest ? bounty?.fundingAmount : bounty?.amount) ||
    BigNumber("0");
  const isActive = ["closed", "canceled"].includes(bounty?.state);

  return (
    <BountyAmountView
      bountyAmount={bountyAmount}
      isActive={isActive}
      symbol={bounty?.transactionalToken?.symbol}
      size={size}
    />
  );
}
