import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { isMobile } from "react-device-detect";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import {
  formatNumberToNScale,
  formatStringToCurrency,
} from "helpers/formatNumber";

import { IssueBigNumberData } from "interfaces/issue-data";

export default function IssueAmountInfo({ issue, size = "lg" }: { issue: IssueBigNumberData, size: "sm" | "lg"}) {
  const { t } = useTranslation(["bounty", "common"]);
  const fundedAmount = issue?.fundedAmount.isNaN() ? BigNumber(0) : issue?.fundedAmount
  const isFundingRequest = !!issue?.fundingAmount?.gt(0);
  const bountyAmount = (isFundingRequest ? issue?.fundingAmount : issue?.amount) || BigNumber("0");
  const isActive = ["closed", "canceled"].includes(issue?.state);

  const percentage =
    BigNumber(fundedAmount.multipliedBy(100).toFixed(2, 1))
      .dividedBy(issue?.fundingAmount)
      .toFixed(1, 1) || 0;

  return (
    <OverlayTrigger
      key="bottom-amount"
      placement="bottom"
      overlay={
        <Tooltip id={"tooltip-amount-bottom"} className="caption-small">
          {formatStringToCurrency(bountyAmount?.toFixed())}{" "}
          {issue?.transactionalToken?.symbol || t("common:misc.token")}
        </Tooltip>
      }
    >
      <div
        className={`row justify-content-md-center m-0 px-1 pb-1 rounded-5 ${
          !isActive ? "bg-black" : "bg-dark-gray"
        } `}
      >
        {isFundingRequest && isMobile ? null : (
          <div
            className={`px-0 pt-1 col-md-12 ${size === "sm" && "text-center"}`}
          >
            <span
              className={`caption-large text-opacity-1 text-white${
                isActive && "-40"
              }`}
            >
              {(+bountyAmount >= 1e-6 &&
                formatNumberToNScale(bountyAmount?.toFixed())) ||
                bountyAmount?.toExponential()}{" "}
              <label
                className={`caption-small text-uppercase ${
                  !isActive
                    ? !issue?.network?.colors?.primary && "text-primary"
                    : "text-white-40"
                }`}
                style={{ color: issue?.network?.colors?.primary }}
              >
                {issue?.transactionalToken?.symbol || t("common:misc.token")}
              </label>
            </span>
          </div>
        )}
        {isFundingRequest &&
          fundedAmount.isLessThan(issue?.fundingAmount) && (
            <>
              <div className={`p-0 col-md-6 col-10 mt-1 ${isMobile && "pt-1"}`}>
                <div className="bg-dark-gray w-100 issue-funding-progress">
                  <div
                    className={`${
                      !issue?.network?.colors?.primary && "bg-primary"
                    } issue-funding-progress`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: issue?.network?.colors?.primary,
                    }}
                  />
                </div>
              </div>
              <div
                className={`issue-percentage-text caption-small py-0 pe-0 ps-1 pb-1 col-2 col-md-2 text-white
              ${isMobile && "pt-1"}`}
              >
                {percentage}%
              </div>
            </>
          )}
      </div>
    </OverlayTrigger>
  );
}
