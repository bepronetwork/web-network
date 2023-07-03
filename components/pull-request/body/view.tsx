import React from "react";

import { useTranslation } from "next-i18next";

import Comment from "components/comment";
import CustomContainer from "components/custom-container";
import GithubLink from "components/github-link";
import NothingFound from "components/nothing-found";

import { pullRequest } from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

import ApproveLink from "./actions/approve-link.view";
import PullRequestButton from "./actions/pull-request-button";

interface PullRequestBodyViewProps {
  currentPullRequest: pullRequest;
  isCreatingReview: boolean;
  handleShowModal: () => void;
  handleCancel: () => void;
  handleMakeReady: () => void;
  isMakeReviewButton: boolean;
  isMakeReadyReviewButton: boolean;
  isCancelButton: boolean;
  isApproveLink: boolean;
  isCancelling: boolean;
  isMakingReady: boolean;
  isGithubConnected: boolean;
  githubPath: string;
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
  isApproveLink,
  isCancelling,
  isMakingReady,
  isGithubConnected,
  githubPath,
}: PullRequestBodyViewProps) {
  const { t } = useTranslation(["common", "pull-request"]);
  
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
            isMakingReady ||
            !isGithubConnected
          }
          isLoading={isCreatingReview}
          withLockIcon={isCancelling || isMakingReady || !isGithubConnected}
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

  function RenderApproveButton({ className = ""}) {
    if(isApproveLink)
      return (
        <ApproveLink
          className={className}
          forcePath={githubPath}
          hrefPath={`pull/${currentPullRequest?.githubId || ""}/files`}
        />
      );
    
    return null;
  }

  return (
    <div className="mx-3 mt-3">
      <CustomContainer>
        {(isMobileView || isTabletView) && (
          <div className="mb-3">
            <RenderMakeReviewButton className="col-12 mb-3"/>
            <RenderMakeReadyReviewButton className="col-12 mb-3"/>
            <RenderCancelButton className="col-12 text-white border-gray-500 "/>
            <RenderApproveButton className="btn btn-primary text-uppercase d-flex justify-content-center col-12"/>
          </div>
        )}
        <div className="">
          <div className="row align-items-center bg-gray-900 border-radius-8 px-3 py-4">
            <div className="row">
              <div className="col">
                <span className="caption-large text-uppercase">
                  {t("pull-request:review", {
                    count: currentPullRequest?.comments?.length,
                  })}
                </span>
              </div>

              <div className={`col gap-20 p-0 d-flex flex-wrap justify-content-end`}>
                {!(isMobileView || isTabletView) && (
                  <>
                  <RenderMakeReviewButton />
                  <RenderMakeReadyReviewButton />
                  <RenderCancelButton />
                  <RenderApproveButton />
                  </>
                )}
                <GithubLink
                  className={(isMobileView || isTabletView) ? "text-primary caption-small" : null}
                  forcePath={githubPath}
                  hrefPath={`pull/${currentPullRequest?.githubId || ""}`}
                >
                  {t("actions.view-on-github")}
                </GithubLink>
              </div>
            </div>

            <div className="col-12 mt-4">
              {!!currentPullRequest?.comments?.length &&
                React.Children.toArray(currentPullRequest?.comments?.map((comment, index) => (
                    <Comment comment={comment} key={index} />
                  )))}

              {!!currentPullRequest?.reviews?.length &&
                React.Children.toArray(currentPullRequest?.reviews?.map((comment, index) => (
                    <Comment comment={comment} key={index} />
                  )))}

              {!currentPullRequest?.comments?.length &&
                !currentPullRequest?.reviews?.length && (
                  <NothingFound
                    description={t("pull-request:errors.no-reviews-found")}
                  />
                )}
            </div>
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
