import { useTranslation } from "next-i18next";

import WarningIcon from "assets/icons/warning-icon";

import { ContextualSpan } from "components/contextual-span";
import If from "components/If";
import ProposalProgressBar from "components/proposal-progress-bar";

import {
  IssueBigNumberData,
  IssueData,
} from "interfaces/issue-data";
import { DistributedAmounts, Proposal } from "interfaces/proposal";

import ProposalActionsButtons from "./buttons/controller";

interface ProposalActionsViewProps {
  proposal: Proposal;
  issue: IssueData | IssueBigNumberData;
  distributedAmounts: DistributedAmounts;
  percentageNeededForDispute: number;
  warnings: string[];
  isUserAbleToDispute: boolean;
  isRefusable: boolean;
  isDisputable: boolean;
  isMergeable: boolean;
}

export default function ProposalActionsView({
  proposal,
  issue,
  distributedAmounts,
  percentageNeededForDispute,
  warnings,
  isUserAbleToDispute,
  isRefusable,
  isDisputable,
  isMergeable,
}: ProposalActionsViewProps) {
  const { t } = useTranslation(["common", "deliverable", "proposal"]);

  const hasWarnings = !!warnings?.length;

  return (
    <div className="bg-gray-900 rounded-5 p-3">
      <div className="">
        <ProposalProgressBar
          issueDisputeAmount={proposal?.disputeWeight?.toNumber()}
          disputeMaxAmount={percentageNeededForDispute || 0}
          isDisputed={proposal?.isDisputed}
          isFinished={issue?.isClosed}
          isMerged={proposal?.isMerged}
          refused={proposal?.refusedByBountyOwner}
          isAbleToDispute={isDisputable}
        />
      </div>

      <div className="mt-5">
        <If condition={isDisputable || isRefusable || isMergeable}>
          <div className="mt-3">
            <ProposalActionsButtons
              issue={issue}
              proposal={proposal}
              distributedAmounts={distributedAmounts}
              isUserAbleToDispute={isUserAbleToDispute}
              isDisputable={isDisputable}
              isRefusable={isRefusable}
              isMergeable={isMergeable}
            />
          </div>
        </If>

        <If condition={hasWarnings}>
          <div className="row mt-3">
            <div className="d-flex justify-conten-start ms-2">
              <div>
                <span className="svg-warning">
                  <WarningIcon width={14} height={14} className="mb-1" />
                </span>
                <span className="text-warning font-weight-500 mt-3 ms-1">
                  {t("proposal:important")}
                </span>
              </div>
            </div>
          </div>

          {warnings?.map((warning, index) =>
            <div className="row mt-2 ms-1" key={`actions-warning-${index}`}>
              <ContextualSpan context="warning" icon={false}>
                {warning}
              </ContextualSpan>
            </div>)}
        </If>
      </div>
    </div>
  );
}
