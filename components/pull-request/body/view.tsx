import Comments from "components/bounty/comments/controller";
import CustomContainer from "components/custom-container";
import If from "components/If";

import { CurrentUserState } from "interfaces/application-state";
import { PullRequest } from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

import PullRequestButton from "./actions/pull-request-button";

interface PullRequestBodyViewProps {
  currentPullRequest: PullRequest;
  isCreatingReview: boolean;
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
  bountyId: string;
}

export default function PullRequestBodyView({
  currentPullRequest,
  isCreatingReview,
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
  bountyId
}: PullRequestBodyViewProps) {  
  const { isMobileView, isTabletView } = useBreakPoint();

  function RenderMakeReviewButton({ className = "" }) {
    if (isMakeReviewButton)
      return (
        <PullRequestButton
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
        <PullRequestButton
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
        <PullRequestButton
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

        <Comments
          type="deliverable"
          updateData={updateComments}
          ids={{
            issueId: +bountyId,
            deliverableId: currentPullRequest?.id,
          }}
          comments={currentPullRequest?.comments}
          currentUser={currentUser}
        />
      </CustomContainer>
    </div>
  );
}
