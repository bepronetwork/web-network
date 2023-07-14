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
import { changeCurrentBountyComments } from "contexts/reducers/change-current-bounty";
import { addToast } from "contexts/reducers/change-toaster";

import { issueParser } from "helpers/issue";

import {
  IssueBigNumberData,
  IssueData,
  PullRequest,
} from "interfaces/issue-data";

import {
  getBountyData,
  getBountyOrPullRequestComments,
  getPullRequestReviews,
  getPullRequestsDetails,
} from "x-hooks/api/bounty/get-bounty-data";
import useApi from "x-hooks/use-api";

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
    createdAt: new Date(pullRequest.createdAt),
  });
  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const { state, dispatch } = useAppState();

  const { createReviewForPR } = useApi();

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
          reviews: currentPullRequest.reviews,
        });
      });
  }

  function updatePrDetails() {
    getPullRequestsDetails(currentBounty?.repository?.githubPath, [
      currentPullRequest,
    ]).then((details) => {
      if (details?.length > 0)
        setCurrentPullRequest({
          ...currentPullRequest,
          comments: currentPullRequest.comments,
          reviews: currentPullRequest.reviews,
          isMergeable: details[0]?.isMergeable,
          merged: details[0]?.merged,
          state: details[0]?.state,
        });
    });
  }

  function handleCreateReview(body: string) {
    if (!state.currentUser?.login) return;

    setIsCreatingReview(true);

    createReviewForPR({
      issueId: String(currentBounty?.issueId),
      pullRequestId: String(prId),
      githubLogin: state.currentUser?.login,
      body,
      networkName: state.Service?.network?.active?.name,
      wallet: state.currentUser.walletAddress
    })
      .then((response) => {
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("pull-request:actions.review.success"),
        }));

        setCurrentPullRequest({
          ...currentPullRequest,
          comments: [...currentPullRequest.comments, response.data],
        });

        dispatch(changeCurrentBountyComments([...state.currentBounty?.comments || [], response.data]))

        setShowModal(false);
      })
      .catch(() => {
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

  const pullRequestComments = await getBountyOrPullRequestComments(bountyDatabase?.repository?.githubPath, 
                                                                   +prId);
  
  const pullRequestReviews = await getPullRequestReviews(bountyDatabase?.repository?.githubPath, 
                                                         +prId);

  const pullRequest: PullRequest = {
    ...pullRequestDatabase,
    isMergeable: pullRequestDetail[0]?.isMergeable,
    merged: pullRequestDetail[0]?.merged,
    state: pullRequestDetail[0]?.state,
    comments: pullRequestComments,
    reviews: pullRequestReviews
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