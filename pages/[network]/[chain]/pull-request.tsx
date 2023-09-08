import { useState } from "react";

import { dehydrate } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
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

import { getReactQueryClient } from "services/react-query";

import { getBountyData } from "x-hooks/api/bounty";
import { getCommentsData, CreateComment } from "x-hooks/api/comments";
import useReactQuery from "x-hooks/use-react-query";

export default function PullRequestPage() {
  const router = useRouter();
  const { t } = useTranslation(["common", "pull-request"]);

  const { id, prId, review } = router.query;

  const [showModal, setShowModal] = useState(!!review);
  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const { state, dispatch } = useAppState();

  const { data: bountyData, invalidate: invalidateBounty } = 
    useReactQuery(["bounty", id?.toString()], () => getBountyData(router.query));

  const currentPullRequest = bountyData?.pullRequests?.find((pr) => +pr.githubId === +prId);
  const pullRequestId = currentPullRequest?.id?.toString();

  const { data: commentsData, invalidate: invalidateComments } =
    useReactQuery(["pullRequest", "comments", pullRequestId], () => getCommentsData({ deliverableId: pullRequestId }));

  const currentBounty = issueParser(bountyData);
  const comments = commentsParser(commentsData);
  const isPullRequestReady = !!currentPullRequest?.isReady;

  function updateBountyData() {
    invalidateBounty();
  }

  function updateCommentData() {
    invalidateComments();
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
      updateCommentData();
      setShowModal(false);
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
        updateComments={updateCommentData}
        handleShowModal={handleShowModal}      
      />

      <CreateReviewModal
        show={showModal && isPullRequestReady}
        currentBounty={currentBounty} 
        pullRequest={{ ...currentPullRequest , comments }}
        isExecuting={isCreatingReview}
        onConfirm={handleCreateReview}
        onCloseClick={handleCloseModal}
      />

      <ConnectWalletButton asModal={true}/>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const queryClient = getReactQueryClient();
  const { id: bountyId, prId } = query;

  const bountyDatabase = await getBountyData(query);
  await queryClient.setQueryData(["bounty", bountyId], bountyDatabase);

  const pullRequestDatabase = bountyDatabase?.pullRequests?.find((pr) => +pr.githubId === +prId);
  const pullRequestId = pullRequestDatabase?.id?.toString();
  await queryClient.prefetchQuery(["pullRequest", "comments", pullRequestId], () => 
    getCommentsData({ deliverableId: pullRequestId }));
                                                           
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
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