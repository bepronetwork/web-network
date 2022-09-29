import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import {
  formatNumberToNScale
} from "helpers/formatNumber";

import Translation from "./translation";

export default function ProposalProgressBar({
  isDisputed = null,
  issueDisputeAmount = 0,
  isFinished = false,
  isMerged = false,
  refused = false
}) {
  const { t } = useTranslation("proposal");
  
  const { wallet } = useAuthentication();

  const [issueState, setIssueState] = useState<string>("");
  const [issueColor, setIssueColor] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const { activeNetwork } = useNetwork();

  const columns = [0, 1, 2, 3, 3];

  function toPercent(value = 0, total = 0, decimals = 2) {
    return ((value / total) * 100).toFixed(decimals);
  }

  function toRepresentationPercent(value = 0, total = 5) {
    return value > 3 ? 100 : (value * 100) / total;
  }

  function getStateColor() {
    if (isDisputed || refused || (!isMerged && isFinished === true)) return "danger";

    if (isDisputed === false && isFinished === true && isMerged)
      return "success";

    if (isDisputed === false) return "purple";

    return "white-50";
  }

  function getStateText() {
    if (refused) return t("status.refused");
    
    if (isDisputed === true || (!isMerged && isFinished === true))
      return t("status.failed");

    if (isDisputed === false && isFinished === false) return t("status.open-for-dispute");

    if (isDisputed === false && isFinished === true && isMerged)
      return t("status.accepted");

    return t("status.waiting");
  }

  function loadDisputeState() {
    setIssueState(getStateText());
    setIssueColor(getStateColor());
    setPercentage(+toPercent(issueDisputeAmount, wallet?.balance?.staked));
  }

  function renderColumn(dotLabel, index) {
    const dotClass = `rounded-circle ${
      !percentage || dotLabel > percentage ? "empty-dot" : `bg-${issueColor}`
    }`;
    const style = { left: index === 0 ? "1%" : `${index * 20}%` };
    const dotStyle = { width: "10px", height: "10px" };
    const isLastColumn = index + 1 === columns.length;

    return (
      <div
        key={`ppb-${index}`}
        className="position-absolute d-flex align-items-center flex-column"
        style={style}
      >
        <div className={dotClass} style={dotStyle}>
          <div
            className={`caption ${
              isLastColumn ? `text-${issueColor}` : "text-white"
            } mt-4 ms-1`}
          >
            {isLastColumn ? ">" : ""}
            {dotLabel}%
          </div>
        </div>
      </div>
    );
  }

  useEffect(loadDisputeState, [
    wallet?.balance?.staked,
    issueDisputeAmount,
    isDisputed,
    isFinished,
    refused,
    isMerged
  ]);

  return (
    <>
      <div className="row mb-2 proposal-progress-bar">
        <div className="col d-flex justify-content-between">
          <h4
            className={`caption-large text-uppercase text-${issueColor} mb-4`}
          >
            {issueState}
          </h4>
          <div className="caption-small d-flex align-items-center mb-4">
            <span className={`text-${issueColor} text-uppercase`}>
              {formatNumberToNScale(issueDisputeAmount)}{" "}
            </span>{" "}
            /{formatNumberToNScale(wallet?.balance?.staked || 0)}{" "}
            <Translation label="$oracles" params={{ token: activeNetwork?.networkToken?.symbol }}/>{" "}
            <span className={`text-${issueColor}`}> ({percentage}%)</span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="ms-2 col-12 position-relative">
          <div className={`progress bg-${issueColor}`}>
            <div
              className={`progress-bar bg-${issueColor}`}
              role="progressbar"
              style={{ width: `${toRepresentationPercent(percentage)}%` }}
            >
              {columns.map(renderColumn)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
