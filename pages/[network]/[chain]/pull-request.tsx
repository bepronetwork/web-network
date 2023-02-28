import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import Button from "components/button";
import Comment from "components/comment";
import ConnectWalletButton from "components/connect-wallet-button";
import CreateReviewModal from "components/create-review-modal";
import CustomContainer from "components/custom-container";
import GithubLink from "components/github-link";
import NothingFound from "components/nothing-found";
import PullRequestHero from "components/pull-request-hero";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import {useAppState} from "contexts/app-state";
import {BountyEffectsProvider} from "contexts/bounty-effects";
import {changeCurrentBountyComments, changeCurrentBountyData} from "contexts/reducers/change-current-bounty";
import {changeLoadState} from "contexts/reducers/change-load";
import {changeSpinners} from "contexts/reducers/change-spinners";
import {addToast} from "contexts/reducers/change-toaster";

import {MetamaskErrors} from "interfaces/enums/Errors";
import {pullRequest} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useBounty} from "x-hooks/use-bounty";
import {useNetwork} from "x-hooks/use-network";

export default function PullRequestPage() {
  const router = useRouter();
  
  const { t } = useTranslation(["common", "pull-request"]);
  
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMakingReady, setIsMakingReady] = useState(false);
  const [pullRequest, setPullRequest] = useState<pullRequest>();
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  
  const { state, dispatch } = useAppState();
  
  const { getDatabaseBounty } = useBounty();
  const { getURLWithNetwork } = useNetwork();
  const { createReviewForPR, processEvent } = useApi();
  const { getExtendedPullRequestsForCurrentBounty } = useBounty();
  const { handleMakePullRequestReady, handleCancelPullRequest } = useBepro();

  const { prId, review } = router.query;

  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isGithubConnected = !!state.currentUser?.login;
  const isPullRequestOpen = pullRequest?.state?.toLowerCase() === "open";
  const isPullRequestReady = !!pullRequest?.isReady;
  const isPullRequestCanceled = !!pullRequest?.isCanceled;
  const isPullRequestCancelable = !!pullRequest?.isCancelable;
  const isPullRequestCreator = pullRequest?.userAddress === state.currentUser?.walletAddress;
  const branchProtectionRules = state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired = 
    branchProtectionRules ? 
      branchProtectionRules[state.currentBounty?.data?.branch]?.requiredApprovingReviewCount || 0 : 0;
  const canUserApprove = state.Service?.network?.repos?.active?.viewerPermission !== "READ";
  const approvalsCurrentPr = pullRequest?.approvals?.total || 0;
  const prsNeedsApproval = approvalsCurrentPr < approvalsRequired;

  function handleCreateReview(body: string) {
    if (!state.currentUser?.login) return;

    setIsCreatingReview(true);

    createReviewForPR({
      issueId: String(state.currentBounty?.data?.issueId),
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

        setPullRequest({
          ...pullRequest,
          comments: [...pullRequest.comments, response.data],
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

  function handleMakeReady() {
    if (!state.currentBounty?.data || !pullRequest) return;

    setIsMakingReady(true);

    handleMakePullRequestReady(state.currentBounty?.data.contractId, pullRequest.contractId)
      .then(txInfo => {
        const {blockNumber: fromBlock} = txInfo as { blockNumber: number };
        return processEvent("pull-request", "ready", state.Service?.network?.lastVisited, {fromBlock});
      })
      .then(() => {
        return getDatabaseBounty(true);
      })
      .then(() => {
        setIsMakingReady(false);
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("pull-request:actions.make-ready.success"),
        }));
      })
      .catch(error => {
        setIsMakingReady(false);

        if (error?.code === MetamaskErrors.UserRejected) return;

        dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: t("pull-request:actions.make-ready.error"),
        }));
      });
  }

  function handleCancel() {
    setIsCancelling(true);

    handleCancelPullRequest(state.currentBounty?.data?.contractId, pullRequest?.contractId)
      .then(txInfo => {
        const {blockNumber: fromBlock} = txInfo as { blockNumber: number };
        return processEvent("pull-request", "canceled", state.Service?.network?.lastVisited, {fromBlock});
      })
      .then(() => {
        getDatabaseBounty(true);

        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("pull-request:actions.cancel.success"),
        }));

        router.push(getURLWithNetwork('/bounty', {
          id: state.currentBounty?.data.githubId,
          repoId: state.currentBounty?.data.repository_id
        }));
      })
      .catch(error => {
        if (error?.code !== MetamaskErrors.UserRejected)
          dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("pull-request:actions.cancel.error"),
          }));
      })
      .finally(() => {
        setIsCancelling(false);
      });
  }

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  useEffect(() => {
    if (!state.currentBounty?.data ||
        !prId || 
        state?.spinners?.pullRequests ||
        !!pullRequest) return;

    dispatch(changeLoadState(true));
    dispatch(changeSpinners.update({pullRequests: true}));

    getExtendedPullRequestsForCurrentBounty()
      .then(pullRequests => {
        dispatch(changeCurrentBountyData(Object.assign(state.currentBounty.data, { pullRequests })));

        return pullRequests.find((pr) => +pr.githubId === +prId);
      })
      .then(setPullRequest)
      .finally(() => {
        dispatch(changeLoadState(false))
        dispatch(changeSpinners.update({pullRequests: false}));
      });

  }, [state.currentBounty?.data, prId]);

  useEffect(() => {
    if (review && pullRequest && state.currentUser?.login) setShowModal(true);
  }, [review, pullRequest, state.currentUser]);

  return (
    <BountyEffectsProvider>
      <PullRequestHero currentPullRequest={pullRequest}/>

      <CustomContainer>
        <div className="mt-3">
          <div className="row align-items-center bg-shadow border-radius-8 px-3 py-4">
            <div className="row">
              <div className="col-8">
                <span className="caption-large text-uppercase">
                  {t("pull-request:review", {
                    count: pullRequest?.comments?.length,
                  })}
                </span>
              </div>

              <div className="col-4 gap-20 p-0 d-flex justify-content-end">
                {/* Make Review Button */}
                {(isWalletConnected && isPullRequestOpen && isPullRequestReady && !isPullRequestCanceled) &&
                  <ReadOnlyButtonWrapper>
                    <Button
                      className="read-only-button text-nowrap"
                      onClick={handleShowModal}
                      disabled={isCreatingReview || isCancelling || isMakingReady || !isGithubConnected}
                      isLoading={isCreatingReview}
                      withLockIcon={isCancelling || isMakingReady || !isGithubConnected}>
                      {t("actions.make-a-review")}
                    </Button>
                  </ReadOnlyButtonWrapper>
                }

                {/* Make Ready for Review Button */}
                {(isWalletConnected &&
                  isPullRequestOpen &&
                  !isPullRequestReady &&
                  !isPullRequestCanceled &&
                  isPullRequestCreator) && (
                  <ReadOnlyButtonWrapper>
                    <Button
                      className="read-only-button text-nowrap"
                      onClick={handleMakeReady}
                      disabled={isCreatingReview || isCancelling || isMakingReady}
                      isLoading={isMakingReady}
                      withLockIcon={isCreatingReview || isCancelling}>
                      {t("pull-request:actions.make-ready.title")}
                    </Button>
                  </ReadOnlyButtonWrapper>
                )
                }

                {/* Cancel Button */}
                {(isWalletConnected &&
                  !isPullRequestCanceled &&
                  isPullRequestCancelable &&
                  isPullRequestCreator) && (
                  <ReadOnlyButtonWrapper>
                    <Button
                      className="read-only-button text-nowrap"
                      onClick={handleCancel}
                      disabled={isCreatingReview || isCancelling || isMakingReady}
                      isLoading={isCancelling}
                      withLockIcon={isCreatingReview || isMakingReady}
                    >
                      {t("actions.cancel")}
                    </Button>
                  </ReadOnlyButtonWrapper>
                )
                }

                {/* Approve Link */}
                { (isWalletConnected && 
                   isGithubConnected && 
                   prsNeedsApproval && 
                   canUserApprove &&
                   isPullRequestReady &&
                   !isPullRequestCanceled) && 
                  <GithubLink
                    forcePath={state.Service?.network?.repos?.active?.githubPath}
                    hrefPath={`pull/${pullRequest?.githubId || ""}/files`}
                    color="primary"
                  >
                    {t("actions.approve")}
                  </GithubLink>
                }

                <GithubLink
                  forcePath={state.Service?.network?.repos?.active?.githubPath}
                  hrefPath={`pull/${pullRequest?.githubId || ""}`}>
                  {t("actions.view-on-github")}
                </GithubLink>
              </div>
            </div>

            <div className="col-12 mt-4">
              {!!pullRequest?.comments?.length &&
                React.Children.toArray(pullRequest?.comments?.map((comment, index) => (
                  <Comment comment={comment} key={index}/>
                )))}

              {!!pullRequest?.reviews?.length &&
                React.Children.toArray(pullRequest?.reviews?.map((comment, index) => (
                  <Comment comment={comment} key={index}/>
                )))}

              {(!pullRequest?.comments?.length && !pullRequest?.reviews?.length) &&
                <NothingFound
                  description={t("pull-request:errors.no-reviews-found")}
                />
              }
            </div>
          </div>
        </div>
      </CustomContainer>

      <CreateReviewModal
        show={showModal && isPullRequestReady}
        pullRequest={pullRequest}
        isExecuting={isCreatingReview}
        onConfirm={handleCreateReview}
        onCloseClick={handleCloseModal}
      />

      <ConnectWalletButton asModal={true}/>
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "pull-request",
        "connect-wallet-button",
      ])),
    },
  };
};
