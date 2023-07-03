import React from "react";

import BigNumber from "bignumber.js";

import BountyDoneIcon from "assets/icons/bounty-done-icon";
import CanceledIcon from "assets/icons/canceled-icon";
import CircleIcon from "assets/icons/circle-icon";

import { IssueState } from "interfaces/issue-data";

interface IBountyStatusInfo {
  issueState: IssueState;
  fundingAmount?: BigNumber;
  fundedAmount?: BigNumber;
}

export default function BountyStatusInfo({
  issueState,
  fundedAmount,
  fundingAmount,
}: IBountyStatusInfo) {
  const isFunding = !!fundingAmount?.gt(0);
  const isPartialFunded = !!fundedAmount?.gt(0) && !!fundedAmount?.lt(fundingAmount);

  const state = isFunding && isPartialFunded ? "partial-funded" : issueState;

  if (issueState === "closed") return <BountyDoneIcon />;

  if (issueState === "canceled") return <CanceledIcon />;

  return <CircleIcon type={state} />;
}
