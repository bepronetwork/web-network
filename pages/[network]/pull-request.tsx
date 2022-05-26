import React, { useContext, useEffect, useState } from "react";

import { PullRequest } from "@taikai/dappkit";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import Button from "components/button";
import Comment from "components/comment";
import ConnectWalletButton from "components/connect-wallet-button";
import CreateReviewModal from "components/create-review-modal";
import CustomContainer from "components/custom-container";
import GithubLink from "components/github-link";
import NothingFound from "components/nothing-found";
import PullRequestHero from "components/pull-request-hero";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { useRepos } from "contexts/repos";

import { pullRequest } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

export default function PullRequestPage() {
  const router = useRouter();
  const { activeRepo } = useRepos();
  const { activeIssue, networkIssue, addNewComment, updateIssue } = useIssue();

  const { createReviewForPR, processEvent } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pullRequest, setPullRequest] = useState<pullRequest>();
  const [networkPullRequest, setNetworkPullRequest] = useState<PullRequest>();
  const { t } = useTranslation(["common", "pull-request"]);
  const { activeNetwork } = useNetwork();
  const { wallet, user } = useAuthentication();
  const { dispatch } = useContext(ApplicationContext);
  const { prId, review } = router.query;
  const { handleMakePullRequestReady, handleCancelPullRequest } = useBepro();
  const { getURLWithNetwork } = useNetworkTheme();

  function loadData() {
    dispatch(changeLoadState(true));
    if (!prId) return;
    const currentPR = activeIssue?.pullRequests.find((pr) => +pr?.githubId === +prId);
    setPullRequest(currentPR);
    setNetworkPullRequest(networkIssue?.pullRequests?.find(pr => +pr.id === +currentPR?.contractId));
    dispatch(changeLoadState(false));
  }

  function handleCreateReview(body) {
    if (!user?.login) return;

    setIsExecuting(true);

    createReviewForPR(String(activeIssue?.issueId),
                      String(prId),
                      user?.login,
                      body,
                      activeNetwork?.name)
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
        addNewComment(pullRequest?.id, response.data);

        setIsExecuting(false);
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
        setIsExecuting(false);
      });
  }

  function handleMakeReady() {
    setIsExecuting(true);

    handleMakePullRequestReady(activeIssue?.contractId, pullRequest?.contractId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
      return processEvent("pull-request", "ready", activeNetwork?.name, { fromBlock });
    })
    .then(() => {
      updateIssue(activeIssue.repository_id, activeIssue.githubId);
      
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("pull-request:actions.make-ready.success"),
      }));
    })
    .catch(() => {
      dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: t("pull-request:actions.make-ready.error"),
      }));
    })
    .finally(() => {
      setIsExecuting(false);
    });
  }

  function handleCancel() {
    setIsExecuting(true);

    handleCancelPullRequest(activeIssue?.contractId, pullRequest?.contractId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
      return processEvent("pull-request", "canceled", activeNetwork?.name, { fromBlock });
    })
    .then(() => {
      updateIssue(activeIssue.repository_id, activeIssue.githubId);
      
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("pull-request:actions.cancel.success"),
      }));

      router.push(getURLWithNetwork('/bounty', {
        id: activeIssue.githubId,
        repoId: activeIssue.repository_id
      }));
    })
    .catch(() => {
      dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: t("pull-request:actions.cancel.error"),
      }));
    })
    .finally(() => {
      setIsExecuting(false);
    });
  }

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  useEffect(() => {
    if (activeIssue && networkIssue) loadData();
  }, [activeIssue, networkIssue]);

  useEffect(() => {
    if (review && pullRequest && user?.login) {
      setShowModal(true);
    }
  }, []);

  return (
    <>
      <PullRequestHero currentPullRequest={pullRequest} />
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
                {wallet?.address &&
                  user?.login &&
                  pullRequest?.state?.toLowerCase() === "open" &&
                  networkPullRequest?.ready &&
                  !networkPullRequest?.canceled && (
                    <ReadOnlyButtonWrapper>
                      <Button
                        className="read-only-button text-nowrap"
                        onClick={handleShowModal}
                      >
                        {t("actions.make-a-review")}
                      </Button>
                    </ReadOnlyButtonWrapper>
                  )}

                  {
                    wallet?.address &&
                    user?.login &&
                    pullRequest?.state?.toLowerCase() === "open" &&
                    pullRequest?.status === "draft" &&
                    !networkPullRequest?.ready &&
                    !networkPullRequest?.canceled &&
                    networkPullRequest?.creator?.toLowerCase() === wallet?.address?.toLowerCase() && (
                      <ReadOnlyButtonWrapper>
                        <Button
                          className="read-only-button text-nowrap"
                          onClick={handleMakeReady}
                        >
                          {t("pull-request:actions.make-ready.title")}
                        </Button>
                      </ReadOnlyButtonWrapper>
                    )
                  }

                  {
                    wallet?.address &&
                    user?.login &&
                    networkPullRequest?.isCancelable &&
                    !networkPullRequest?.canceled &&
                    networkPullRequest?.creator?.toLowerCase() === wallet?.address?.toLowerCase() && (
                      <ReadOnlyButtonWrapper>
                        <Button
                          className="read-only-button text-nowrap"
                          onClick={handleCancel}
                        >
                          {t("actions.cancel")}
                        </Button>
                      </ReadOnlyButtonWrapper>
                    )
                  }

                  <GithubLink
                    repoId={String(activeRepo?.id)}
                    forcePath={activeRepo?.githubPath}
                    hrefPath={`pull/${pullRequest?.githubId || ""}`}
                  >
                    {t("actions.view-on-github")}
                  </GithubLink>
              </div>
            </div>
            <div className="col-12 mt-4">
              {(pullRequest?.comments?.length > 0 &&
                React.Children.toArray(pullRequest?.comments?.map((comment, index) => (
                    <Comment comment={comment} key={index} />
                  )))) || (
                <NothingFound
                  description={t("pull-request:errors.no-reviews-found")}
                />
              )}
            </div>
          </div>
        </div>
      </CustomContainer>

      <CreateReviewModal
        show={showModal}
        onCloseClick={handleCloseModal}
        issue={activeIssue}
        pullRequest={pullRequest}
        onConfirm={handleCreateReview}
        isExecuting={isExecuting}
      />

      <ConnectWalletButton asModal={true} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "pull-request",
        "connect-wallet-button",
      ])),
    },
  };
};
