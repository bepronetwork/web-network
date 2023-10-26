import React, { useState } from "react";

import { useTranslation } from "next-i18next";

import CreateDeliverableButton from "components/bounty/page-actions/actions/create-deliverable.view";
import CreateProposalButton from "components/bounty/page-actions/actions/create-proposal.view";
import EditBountyButton from "components/bounty/page-actions/actions/edit-bounty.view";
import StartWorkingButton from "components/bounty/page-actions/actions/start-working.view";
import TabletAndMobileButton from "components/bounty/page-actions/actions/tablet-and-mobile.view";
import UpdateAmountButton from "components/bounty/page-actions/actions/update-amount.view";
import { PageActionsViewProps } from "components/bounty/page-actions/page-actions";
import UpdateBountyAmountModal from "components/bounty/update-bounty-amount-modal/controller";
import If from "components/If";
import ProposalModal from "components/proposal/new-proposal-modal/controller";

import useBreakPoint from "x-hooks/use-breakpoint";

export default function PageActionsView({
  bounty,
  handleEditIssue,
  onCreateDeliverableClick,
  handleStartWorking,
  isWalletConnected,
  isCreatePr,
  isCreateProposal,
  isExecuting,
  isUpdateAmountButton,
  isStartWorkingButton,
  isEditButton,
  updateBountyData,
  deliverables
}: PageActionsViewProps) {
  const { t } = useTranslation([
    "common",
    "deliverable",
    "bounty",
    "proposal",
  ]);
  
  const [showPRProposal, setShowPRProposal] = useState(false);
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  const { isMobileView, isTabletView } = useBreakPoint();

  function handleActionWorking() {
    handleStartWorking();
  }

  return (
    <div className="mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center d-none d-lg-block">
              {t("misc.details")}
            </h4>

            <div className="d-none d-lg-block">
              <div className="d-flex align-items-center gap-20">
                <If condition={isStartWorkingButton}>
                  <StartWorkingButton 
                    onClick={handleActionWorking}
                    isExecuting={isExecuting}
                  />
                </If>

                <If condition={isCreatePr}>
                  <CreateDeliverableButton 
                    onClick={onCreateDeliverableClick}
                    disabled={!isWalletConnected}
                  />
                </If>

                <If condition={isUpdateAmountButton}>
                  <UpdateAmountButton onClick={() => setShowUpdateAmount(true)} />
                </If>

                <If condition={isCreateProposal}>
                  <CreateProposalButton 
                    onClick={() => setShowPRProposal(true)}
                    disabled={!isWalletConnected}
                  />
                </If>

                <If condition={isEditButton}>
                  <EditBountyButton onClick={handleEditIssue} />
                </If>
              </div>
            </div>

            <If condition={isMobileView || isTabletView}>
              <div className="col-12 d-lg-none">
                <TabletAndMobileButton 
                  isStartWorkingButton={isStartWorkingButton}
                  isCreatePr={isCreatePr}
                  isCreateProposal={isCreateProposal}
                  isExecuting={isExecuting}
                  onCreateDeliverableClick={onCreateDeliverableClick}
                  handleShowPRProposal={setShowPRProposal}
                  handleActionWorking={handleActionWorking}
                />
              </div>
            </If>
          </div>
        </div>
      </div>
   
        <>
          <UpdateBountyAmountModal
            show={showUpdateAmount}
            bounty={bounty}
            handleClose={() => setShowUpdateAmount(false)}
            updateBountyData={updateBountyData}
          />

          <ProposalModal
            deliverables={deliverables}
            show={showPRProposal}
            onCloseClick={() => setShowPRProposal(false)}
            currentBounty={bounty}
            updateBountyData={updateBountyData}
          />
        </>
    </div>
  );
}
