import { OverlayTrigger, Tooltip } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import {
  formatNumberToNScale,
  formatStringToCurrency,
} from "helpers/formatNumber";

import { IssueBigNumberData } from "interfaces/issue-data";

export default function IssueAmountInfo({ issue, size = "lg" }: { issue: IssueBigNumberData, size: "sm" | "lg"}) {
  const { t } = useTranslation(["bounty", "common"]);
  const isFundingRequest = !!issue?.fundingAmount?.gt(0);
  const bountyAmount = (isFundingRequest ? issue?.fundingAmount : issue?.amount) || BigNumber("0");
  const isActive = ["closed", "canceled"].includes(issue?.state);

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
        className={`m-0 px-1 py-1 border-radius-4 border border-gray-800 ${
          !isActive ? "bg-gray-950" : "bg-dark-gray"
        } `}
      >
          <div
            className={`px-0 text-truncate ${size === "sm" && "text-center"}`}
          >
            <span
              className={`mx-2 text-opacity-1 text-white${
                isActive && "-40"
              }`}
            >
              {(+bountyAmount >= 1e-6 &&
                formatNumberToNScale(bountyAmount?.toFixed())) ||
                bountyAmount?.toExponential()}{" "}
              <label
                className={`text-uppercase text-white-40`}
              >
                {issue?.transactionalToken?.symbol || t("common:misc.token")}
              </label>
            </span>
          </div>
      </div>
    </OverlayTrigger>
  );
}
