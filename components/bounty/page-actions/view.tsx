import React, { useState } from "react";

import { useTranslation } from "next-i18next";

import ConnectGithub from "components/connect-github";
import { ContextualSpan } from "components/contextual-span";
import CreatePullRequestModal from "components/create-pull-request-modal";
import If from "components/If";
import Modal from "components/modal";
import ProposalModal from "components/proposal/create-proposal-modal";
import Translation from "components/translation";
import UpdateBountyAmountModal from "components/update-bounty-amount-modal";

import useBreakPoint from "x-hooks/use-breakpoint";

import CreateProposalButton from "./actions/create-proposal.view";
import CreatePullRequestButton from "./actions/create-pull-request.view";
import EditBountyButton from "./actions/edit-bounty.view";
import ForkRepositoryLink from "./actions/fork-repository.view";
import StartWorkingButton from "./actions/start-working.view";
import TabletAndMobileButton from "./actions/tablet-and-mobile.view";
import UpdateAmountButton from "./actions/update-amount.view";
import { PageActionsViewProps } from "./page-actions";

export default function PageActionsView({
  bounty,
  currentUser,
  handleEditIssue,
  handlePullrequest,
  handleStartWorking,
  isWalletConnected,
  isGithubConnected,
  isCreatePr,
  isCreateProposal,
  isExecuting,
  showPRModal,
  handleShowPRModal,
  ghVisibility,
  isUpdateAmountButton,
  isStartWorkingButton,
  isForkRepositoryLink,
  isEditButton,
  updateBountyData
}: PageActionsViewProps) {
  const { t } = useTranslation([
    "common",
    "pull-request",
    "bounty",
    "proposal",
  ]);
  
  const { isMobileView, isTabletView } = useBreakPoint();
  const [showPRProposal, setShowPRProposal] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  function handleActionPr(arg: {
    title: string;
    description: string;
    branch: string;
  }): Promise<void> {
    if (!ghVisibility)
      return new Promise((resolve) => resolve(setShowGHModal(true)));

    return handlePullrequest(arg);
  }

  function handleActionWorking() {
    if (!ghVisibility) return setShowGHModal(true);
    handleStartWorking();
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          {!isGithubConnected && isWalletConnected && (
            <ContextualSpan context="info" className="mb-2" isAlert>
              {t("actions.connect-github-to-work")}
            </ContextualSpan>
          )}

          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center d-none d-lg-block">
              {t("misc.details")}
            </h4>
            <div className="d-none d-lg-block">
              <div className="d-flex align-items-center gap-20">
                <If condition={isForkRepositoryLink}>
                  <ForkRepositoryLink path={bounty?.repository?.githubPath} />
                </If>
                <If condition={isStartWorkingButton}>
                  <StartWorkingButton 
                    onClick={handleActionWorking}
                    isExecuting={isExecuting}
                  />
                </If>
                <If condition={isCreatePr}>
                  <CreatePullRequestButton 
                    onClick={() => handleShowPRModal(true)}
                    disabled={!currentUser?.login || !isWalletConnected}
                  />
                </If>
                <If condition={isUpdateAmountButton}>
                  <UpdateAmountButton onClick={() => setShowUpdateAmount(true)} />
                </If>
                <If condition={isCreateProposal}>
                  <CreateProposalButton 
                    onClick={() => setShowPRProposal(true)}
                    disabled={!currentUser?.login || !isWalletConnected}
                  />
                </If>
                <If condition={isEditButton}>
                  <EditBountyButton onClick={handleEditIssue} />
                </If>
                <If condition={!isGithubConnected && isWalletConnected}>
                  <ConnectGithub size="sm" />
                </If>
              </div>
            </div>
            <If condition={isMobileView || isTabletView}>
              <div className="col-12 d-lg-none">
                <TabletAndMobileButton 
                  isStartWorkingButton={isStartWorkingButton}
                  isConnectGithub={!isGithubConnected && isWalletConnected}
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
            onConfirm={handleActionPr}
            repo={
              (currentUser?.login &&
                bounty?.repository?.githubPath &&
                bounty?.repository?.githubPath) ||
              ""
            }
            onCloseClick={() => handleShowPRModal(false)}
            currentBounty={bounty}
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

      <Modal
        title={t("modals.gh-access.title")}
        centerTitle
        show={showGHModal}
        okLabel={t("actions.close")}
        onOkClick={() => setShowGHModal(false)}
      >
        <h5 className="text-center">
          <Translation ns="common" label="modals.gh-access.content" />
        </h5>
      </Modal>
    </div>
  );
}
