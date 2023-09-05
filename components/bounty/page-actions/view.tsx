import React, { useState } from "react";

import { useTranslation } from "next-i18next";

import CreateProposalButton from "components/bounty/page-actions/actions/create-proposal.view";
import CreatePullRequestButton from "components/bounty/page-actions/actions/create-pull-request.view";
import EditBountyButton from "components/bounty/page-actions/actions/edit-bounty.view";
import StartWorkingButton from "components/bounty/page-actions/actions/start-working.view";
import TabletAndMobileButton from "components/bounty/page-actions/actions/tablet-and-mobile.view";
import UpdateAmountButton from "components/bounty/page-actions/actions/update-amount.view";
import { PageActionsViewProps } from "components/bounty/page-actions/page-actions";
import CreatePullRequestModal from "components/create-pull-request-modal";
import If from "components/If";
import ProposalModal from "components/proposal/create-proposal-modal";
import UpdateBountyAmountModal from "components/update-bounty-amount-modal";

import useBreakPoint from "x-hooks/use-breakpoint";

export default function PageActionsView({
  bounty,
  handleEditIssue,
  handlePullrequest,
  handleStartWorking,
  isWalletConnected,
  isCreatePr,
  isCreateProposal,
  isExecuting,
  showPRModal,
  handleShowPRModal,
  isUpdateAmountButton,
  isStartWorkingButton,
  isEditButton,
  updateBountyData
}: PageActionsViewProps) {
  const { t } = useTranslation([
    "common",
    "pull-request",
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
                  <CreatePullRequestButton 
                    onClick={() => handleShowPRModal(true)}
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
                  handleShowPRModal={handleShowPRModal}
                  handleShowPRProposal={setShowPRProposal}
                  handleActionWorking={handleActionWorking}
                />
              </div>
            </If>
          </div>
        </div>
      </div>
   
        <>
          <CreatePullRequestModal
            show={showPRModal}
            title={bounty?.title}
            description={bounty?.body}
            onConfirm={handlePullrequest}
            onCloseClick={() => handleShowPRModal(false)}
          />

          <UpdateBountyAmountModal
            show={showUpdateAmount}
            transactionalAddress={bounty?.transactionalToken?.address}
            bountyId={bounty?.contractId}
            handleClose={() => setShowUpdateAmount(false)}
            updateBountyData={updateBountyData}
          />

          <ProposalModal
            amountTotal={bounty?.amount}
            pullRequests={bounty?.pullRequests}
            show={showPRProposal}
            onCloseClick={() => setShowPRProposal(false)}
            currentBounty={bounty}
            updateBountyData={updateBountyData}
          />
        </>
    </div>
  );
}
