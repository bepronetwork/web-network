import React, { useContext, useEffect, useState } from "react";

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
import { addToast } from "contexts/reducers/add-toast";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { useRepos } from "contexts/repos";

import { pullRequest } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";

export default function PullRequest() {
  const router = useRouter();
  const { activeRepo } = useRepos();
  const { activeIssue, addNewComment, updateIssue } = useIssue();

  const { createReviewForPR } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pullRequest, setPullRequest] = useState<pullRequest>();
  const { t } = useTranslation(["common", "pull-request"]);
  const { network } = useNetwork();
  const { wallet, user } = useAuthentication();
  const { dispatch } = useContext(ApplicationContext);
  const { prId, review } = router.query;

  function loadData() {
    dispatch(changeLoadState(true));
    if (!prId) return;
    const currentPR = activeIssue?.pullRequests.find((pr) => +pr?.githubId === +prId);
    setPullRequest(currentPR);
    dispatch(changeLoadState(false));
  }

  function handleCreateReview({ body }) {
    if (!user?.login) return;

    setIsExecuting(true);

    createReviewForPR(String(activeIssue?.issueId),
                      String(prId),
                      user?.login,
                      body,
                      network?.name)
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
      });
  }

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  useEffect(() => {
    loadData();
  }, [activeIssue]);

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

              <div className="col-4 gap-2 p-0 d-flex justify-content-center">
                {wallet?.address &&
                  user?.login &&
                  pullRequest?.state === "open" && (
                    <ReadOnlyButtonWrapper>
                      <Button
                        className="read-only-button text-nowrap"
                        onClick={handleShowModal}
                      >
                        {t("actions.make-a-review")}
                      </Button>
                    </ReadOnlyButtonWrapper>
                  )}
                
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
