import { useTranslation } from "next-i18next";

import Comments from "components/bounty/comments/controller";
import { ContextualSpan } from "components/contextual-span";
import CustomContainer from "components/custom-container";
import If from "components/If";

import { CurrentUserState } from "interfaces/application-state";
import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

import DeliverableInfoCuratorCard from "../info-curator-card/controller";
import DeliverableButton from "./actions/deliverable-button";
import DeliverableDescription from "./description/view";
import DeliverableOriginLink from "./origin-link/controller";

interface DeliverableBodyViewProps {
  currentBounty: IssueBigNumberData;
  currentDeliverable: Deliverable;
  isCreatingReview: boolean;
  showMakeReadyWarning: boolean;
  handleShowModal: () => void;
  handleCancel: () => void;
  handleMakeReady: () => void;
  updateComments: () => void;
  isMakeReviewButton: boolean;
  isMakeReadyReviewButton: boolean;
  isCancelButton: boolean;
  isCancelling: boolean;
  isMakingReady: boolean;
  currentUser: CurrentUserState;
  isCouncil: boolean;
}

export default function DeliverableBodyView({
  currentBounty,
  currentDeliverable,
  isCreatingReview,
  showMakeReadyWarning,
  handleShowModal,
  handleCancel,
  handleMakeReady,
  isMakeReviewButton,
  isMakeReadyReviewButton,
  isCancelButton,
  isCancelling,
  isMakingReady,
  updateComments,
  currentUser,
  isCouncil
}: DeliverableBodyViewProps) {  
  const { t } = useTranslation("deliverable");
  const { isMobileView, isTabletView } = useBreakPoint();

  function RenderMakeReviewButton({ className = "" }) {
    if (isMakeReviewButton && !currentBounty?.isClosed)
      return (
        <DeliverableButton
          type="review"
          className={className}
          onClick={handleShowModal}
          disabled={
            isCreatingReview ||
            isCancelling ||
            isMakingReady
          }
          isLoading={isCreatingReview}
          withLockIcon={isCancelling || isMakingReady}
        />
      );
    
    return null;
  }

  function RenderMakeReadyReviewButton({ className = "" }) {
    if (isMakeReadyReviewButton)
      return (
        <DeliverableButton
          type="ready-review"
          className={className}
          onClick={handleMakeReady}
          disabled={isCreatingReview || isCancelling || isMakingReady}
          isLoading={isMakingReady}
          withLockIcon={isCreatingReview || isCancelling}
        />
      );

    return null;
  }

  function RenderCancelButton({ className = ""}) {
    if(isCancelButton)
      return (
        <DeliverableButton
          type="cancel"
          className={className}
          onClick={handleCancel}
          disabled={isCreatingReview || isCancelling || isMakingReady}
          isLoading={isCancelling}
          withLockIcon={isCreatingReview || isMakingReady}
        />
      );

    return null;
  }

  return (
    <div className="mt-3">
      <CustomContainer>
        <If condition={!isCouncil}>
          <DeliverableInfoCuratorCard />
        </If>

        <If condition={isMobileView || isTabletView}>
          <div className="mb-3">
            <RenderMakeReviewButton className="col-12 mb-3"/>
            <RenderMakeReadyReviewButton className="col-12 mb-3"/>
            <RenderCancelButton className="col-12 text-white border-gray-500 "/>
          </div>
        </If>

        <div className="">
          <div className="row pb-2 mx-1">
              <div className={`col gap-20 p-0 d-flex flex-wrap justify-content-end`}>
                <If condition={!(isMobileView || isTabletView)}>
                  <>
                    <RenderMakeReviewButton />
                    <RenderMakeReadyReviewButton />
                    <RenderCancelButton />
                  </>
                </If>
              </div>
          </div>
        </div>

        <If condition={showMakeReadyWarning}>
          <ContextualSpan
            context="warning"
            className="mt-2 mb-3"
            isAlert
          >
            {t("make-ready-warning")}
          </ContextualSpan>
        </If>

        <DeliverableOriginLink url={currentDeliverable.deliverableUrl} />

        <DeliverableDescription description={currentDeliverable.description}/>

        {currentDeliverable?.markedReadyForReview && (
          <Comments
            type="deliverable"
            updateData={updateComments}
            ids={{
              issueId: +currentBounty?.id,
              deliverableId: currentDeliverable?.id,
            }}
            comments={currentDeliverable?.comments}
            currentUser={currentUser}
            disableCreateComment={currentDeliverable?.canceled || currentBounty?.isClosed || !isCouncil}
          />
        )}
      </CustomContainer>
    </div>
  );
}
