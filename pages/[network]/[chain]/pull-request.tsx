import React, { useState } from "react";

import { SSRConfig, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import ConnectWalletButton from "components/connect-wallet-button";
import PullRequestBody from "components/pull-request/body/controller";
import CreateReviewModal from "components/pull-request/create-review-modal/controller";
import PullRequestHero from "components/pull-request/hero/controller";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { commentsParser, issueParser } from "helpers/issue";

import {
  IssueBigNumberData,
  IssueData,
  PullRequest,
} from "interfaces/issue-data";

import {
  getBountyData,
  getPullRequestsDetails,
} from "x-hooks/api/bounty/get-bounty-data";
import getCommentsData from "x-hooks/api/comments/get-comments-data";
import CreateComment from "x-hooks/api/comments/post-comments";

interface PagePullRequestProps {
  bounty: IssueData;
  pullRequest: PullRequest;
  _nextI18Next?: SSRConfig;
}

export default function PullRequestPage({ pullRequest, bounty }: PagePullRequestProps) {
  const { t } = useTranslation(["common", "pull-request"]);
  const router = useRouter();

  const { prId, review } = router.query;

  const [showModal, setShowModal] = useState(!!review);
  const [currentBounty, setCurrentBounty] = useState<IssueBigNumberData>(issueParser(bounty));
  const [currentPullRequest, setCurrentPullRequest] = useState<PullRequest>({
    ...pullRequest,
    comments: commentsParser(pullRequest.comments),
    createdAt: new Date(pullRequest.createdAt),
  });
  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const { state, dispatch } = useAppState();

  const isPullRequestReady = !!currentPullRequest?.isReady;

  function updateBountyData() {
    getBountyData(router.query)
      .then(issueParser)
      .then((bounty) => {
        const pullRequestDatabase = bounty?.pullRequests?.find((pr) => +pr.githubId === +prId);

        setCurrentBounty(bounty);
        setCurrentPullRequest({
          ...pullRequestDatabase,
          isMergeable: currentPullRequest?.isMergeable,
          merged: currentPullRequest?.merged,
          state: currentPullRequest?.state,
          comments: currentPullRequest.comments,
        });
      });
  }

  function updateCommentData() {
    getCommentsData({ deliverableId: currentPullRequest?.id.toString() })
     .then((comments) => setCurrentPullRequest({
      ...currentPullRequest,
      comments: commentsParser(comments)
     }))
  }

  function updatePrDetails() {
    getPullRequestsDetails(currentBounty?.repository?.githubPath, [
      currentPullRequest,
    ]).then((details) => {
      if (details?.length > 0)
        setCurrentPullRequest({
          ...currentPullRequest,
          comments: currentPullRequest.comments,
          isMergeable: details[0]?.isMergeable,
          merged: details[0]?.merged,
          state: details[0]?.state,
        });
    });
  }

  function handleCreateReview(body: string) {
    if (!state.currentUser?.walletAddress) return;

    setIsCreatingReview(true);

    CreateComment({
      type: 'review',
      issueId: +currentBounty.id,
      deliverableId: currentPullRequest.id,
      comment: body
    }).then(() => {
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("pull-request:actions.review.success"),
      }));
      updateCommentData()
      setShowModal(false)
    }).catch(() => {
      dispatch(addToast({
        type: "danger",
        title: t("actions.failed"),
        content: t("pull-request:actions.review.error"),
      }));
    })
    .finally(() => {
      setIsCreatingReview(false);
    });
  }

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <>
      <PullRequestHero currentPullRequest={currentPullRequest} currentBounty={currentBounty} />

      <PullRequestBody 
        currentPullRequest={currentPullRequest} 
        currentBounty={currentBounty} 
        isCreatingReview={isCreatingReview} 
        updateBountyData={updateBountyData}
        updatePrDetails={updatePrDetails}
        updateComments={updateCommentData}
        handleShowModal={handleShowModal}      
      />

      <CreateReviewModal
        show={showModal && isPullRequestReady}
        currentBounty={currentBounty} 
        pullRequest={currentPullRequest}
        isExecuting={isCreatingReview}
        onConfirm={handleCreateReview}
        onCloseClick={handleCloseModal}
      />

      <ConnectWalletButton asModal={true}/>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const { prId } = query;

  const bountyDatabase = await getBountyData(query)

  const pullRequestDatabase = bountyDatabase?.pullRequests?.find((pr) => +pr.githubId === +prId)

  const pullRequestDetail = await getPullRequestsDetails(bountyDatabase?.repository?.githubPath,
                                                         [pullRequestDatabase]);

  const pullRequestComments = await getCommentsData({ deliverableId: pullRequestDatabase?.id.toString() })

  const pullRequest: PullRequest = {
    ...pullRequestDatabase,
    isMergeable: pullRequestDetail[0]?.isMergeable,
    merged: pullRequestDetail[0]?.merged,
    state: pullRequestDetail[0]?.state,
    comments: pullRequestComments
  }
                                                           
  return {
    props: {
      bounty: bountyDatabase,
      pullRequest,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button",
        "funding"
      ]))
    }
  };
};