import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import If from "components/If";
import ProposalMerge from "components/proposal-merge";

import { DistributedAmounts, Proposal } from "interfaces/proposal";

interface ProposalActionsButtonsViewProps {
  proposal: Proposal;
  issueAmount: BigNumber;
  issueDbId: string;
  transactionalTokenSymbol: string;
  isAbleToMerge: boolean;
  isAbleToDispute: boolean;
  isAbleToRefuse: boolean;
  isMerging: boolean;
  isDisputing: boolean;
  isRefusing: boolean;
  onlyMerge?: boolean;
  distributedAmounts: DistributedAmounts;
  onMerge: () => Promise<void>;
  onDispute: () => Promise<void>;
  onRefuse: () => Promise<void>;
}

export default function ProposalActionsButtonsView({
  proposal,
  issueAmount,
  issueDbId,
  transactionalTokenSymbol,
  isAbleToMerge,
  isAbleToDispute,
  isAbleToRefuse,
  isMerging,
  isDisputing,
  isRefusing,
  onlyMerge,
  distributedAmounts,
  onMerge,
  onDispute,
  onRefuse,
}: ProposalActionsButtonsViewProps) {
  const { t } = useTranslation(["common"]);

  const isDisputeButtonDisabled = isRefusing || isMerging || isDisputing || !isAbleToDispute;
  const isRefuseButtonDisabled = !isAbleToRefuse || isRefusing || isDisputing || isMerging;
  const responsiveClass = onlyMerge ? "d-block d-xl-none" : "d-none d-xl-block";

  return(
    <div className="row justify-content-center justify-content-xl-between gap-2">
      <If condition={isAbleToMerge}>
        <div className={`col-12 col-xl ${responsiveClass}`}>
          <div className="row">
            <ProposalMerge
              amountTotal={issueAmount}
              tokenSymbol={transactionalTokenSymbol}
              proposal={proposal}
              isMerging={isMerging}
              idBounty={issueDbId}
              canMerge={isAbleToMerge}
              distributedAmounts={distributedAmounts}
              onClickMerge={onMerge}
            />
          </div>
        </div>
      </If>

      <If condition={isAbleToDispute && !onlyMerge}>
        <div className="col-12 col-xl">
          <div className="row">
            <ContractButton
              textClass="text-uppercase text-white"
              color="purple"
              disabled={isDisputeButtonDisabled}
              onClick={onDispute}
              isLoading={isDisputing}
              withLockIcon={!isAbleToDispute || isMerging || isRefusing}
            >
              <span>{t("actions.dispute")}</span>
            </ContractButton>
          </div>
        </div>
      </If>

      <If condition={isAbleToRefuse && !onlyMerge}>
        <div className="col-12 col-xl">
            <div className="row">
              <ContractButton
                textClass="text-uppercase text-white"
                color="danger"
                disabled={isRefuseButtonDisabled}
                onClick={onRefuse}
                isLoading={isRefusing}
                withLockIcon={isDisputing || isMerging}
              >
                <span>{t("actions.refuse")}</span>
              </ContractButton>
            </div>
          </div>
      </If>
    </div>
  );
}