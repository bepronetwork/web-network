import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import BountyHero from "components/bounty-hero";
import CustomContainer from "components/custom-container";
import IssueComments from "components/issue-comments";
import IssueDescription from "components/issue-description";
import IssueProposalProgressBar from "components/issue-proposal-progress-bar";
import IssueProposals from "components/issue-proposals";
import IssuePullRequests from "components/issue-pull-requests";
import PageActions from "components/page-actions";
import TabbedNavigation from "components/tabbed-navigation";
import Translation from "components/translation";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useRepos } from "contexts/repos";

import { TabbedNavigationItem } from "interfaces/tabbed-navigation";

import useApi from "x-hooks/use-api";
import useMergeData from "x-hooks/use-merge-data";
import useOctokit from "x-hooks/use-octokit";

export default function PageIssue() {
  const router = useRouter();
  const { t } = useTranslation("bounty");

  const [isWorking, setIsWorking] = useState(false);
  const [hasOpenPR, setHasOpenPR] = useState(false);
  const [commentsIssue, setCommentsIssue] = useState();
  const [isRepoForked, setIsRepoForked] = useState(false);
  const [mergedPullRequests, setMergedPullRequests] = useState([]);

  const { wallet, user } = useAuthentication();

  const { activeRepo } = useRepos();
  const { getUserRepos } = useOctokit();
  const { userHasPR } = useApi();
  const { getMergedDataFromPullRequests } = useMergeData();
  const {
    activeIssue: issue,
    networkIssue,
    updateIssue,
    getNetworkIssue
  } = useIssue();

  const { id, repoId } = router.query;

  const tabs: TabbedNavigationItem[] = [
    {
      eventKey: "proposals",
      title: (
        <Translation
          ns="proposal"
          label={"labelWithCount"}
          params={{ count: +networkIssue?.proposals.length || 0 }}
        />
      ),
      isEmpty: !(networkIssue?.proposals.length > 0),
      component: (
        <IssueProposals
          key="tab-proposals"
          issue={issue}
          className="border-top-0"
        />
      ),
      description: t("description_proposal")
    },
    {
      eventKey: "pull-requests",
      isEmpty: !(mergedPullRequests.length > 0),
      title: (
        <Translation
          ns="pull-request"
          label={"labelWithCount"}
          params={{ count: mergedPullRequests.length || 0 }}
        />
      ),
      component: (
        <IssuePullRequests
          key="tab-pull-requests"
          className="border-top-0"
          issue={issue}
        />
      ),
      description: t("description_pull-request")
    }
  ];

  function getRepoForked() {
    if (!activeRepo || !user?.login) return;

    getUserRepos(user?.login, activeRepo.githubPath.split("/")[1])
      .then(({ data }) => {
        const isFokerd = data?.fork || data.owner.login === user?.login;
        setIsRepoForked(isFokerd);
      })
      .catch((e) => {
        console.log("Failed to get users repositories: ", e);
      });

    userHasPR(`${repoId}/${id}`, user?.login)
      .then((result) => {
        setHasOpenPR(!!result);
      })
      .catch((e) => {
        console.log("Failed to list PRs", e);
      });
  }

  function loadIssueData() {
    if (user?.login && activeRepo) getRepoForked();
  }

  function addNewComment(comment) {
    setCommentsIssue([...(commentsIssue as any), comment] as any);
  }

  function checkIsWorking() {
    if (issue?.working && user?.login)
      setIsWorking(issue.working.some((el) => el === user?.login));
  }

  function loadMergedPullRequests() {
    if (issue && wallet?.address)
      getMergedDataFromPullRequests(issue.repository?.githubPath,
                                    issue.pullRequests).then(setMergedPullRequests);
  }

  function syncLocalyState() {
    // eslint-disable-next-line no-unsafe-optional-chaining
    if (issue?.comments) setCommentsIssue([...issue?.comments] as any);
  }

  function refreshIssue() {
    updateIssue(`${issue.repository_id}`, issue.githubId).catch(() =>
      router.push("/404"));
  }

  useEffect(syncLocalyState, [issue, activeRepo]);
  useEffect(checkIsWorking, [issue, user?.login]);
  useEffect(loadMergedPullRequests, [issue, wallet?.address]);
  useEffect(loadIssueData, [
    user?.login,
    wallet?.address,
    id,
    issue,
    activeRepo
  ]);

  return (
    <>
      <BountyHero />
      <PageActions
        state={issue?.state}
        developers={issue?.developers}
        finalized={networkIssue?.closed || networkIssue?.canceled}
        isIssueinDraft={networkIssue?.isDraft}
        networkCID={networkIssue?.cid || issue?.issueId}
        issueId={issue?.issueId}
        title={issue?.title}
        description={issue?.body}
        handleBeproService={getNetworkIssue}
        handleMicroService={refreshIssue}
        pullRequests={issue?.pullRequests || []}
        mergeProposals={issue?.mergeProposals}
        amountIssue={networkIssue?.tokenAmount}
        forks={activeRepo?.forks}
        githubLogin={user?.login}
        hasOpenPR={hasOpenPR}
        isRepoForked={isRepoForked}
        isWorking={isWorking}
        issueCreator={networkIssue?.creator}
        repoPath={issue?.repository?.githubPath}
        githubId={issue?.githubId}
        addNewComment={addNewComment}
        finished={networkIssue?.isFinished}
      />
      {(networkIssue?.proposals.length > 0 ||
        mergedPullRequests.length > 0) &&
        wallet?.address && (
          <CustomContainer className="mb-4">
            <TabbedNavigation
              className="issue-tabs"
              tabs={tabs}
              collapsable
            />
          </CustomContainer>
        )}
      {networkIssue ? (
        <div className="container mb-1">
          <div className="d-flex bd-highlight justify-content-center mx-2 px-4">
            <div className="ps-3 pe-0 ms-0 me-2 w-65 bd-highlight">
              <div className="container">
                <IssueDescription description={issue?.body || ""} />
              </div>
            </div>
            <div className="p-0 me-3 flex-shrink-0 w-25 bd-highlight">
              <div className="sticky-bounty">
                <IssueProposalProgressBar
                  isFinalized={networkIssue?.closed || networkIssue?.canceled}
                  isIssueinDraft={networkIssue.isDraft}
                  mergeProposalAmount={networkIssue?.proposals?.length}
                  isFinished={networkIssue?.isFinished}
                  isCanceled={
                    issue?.state === "canceled" || networkIssue?.canceled
                  }
                  creationDate={networkIssue.creationDate}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CustomContainer>
          <IssueDescription description={issue?.body || ""} />
        </CustomContainer>
      )}
      <IssueComments
        comments={commentsIssue}
        repo={issue?.repository?.githubPath}
        issueId={id}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  locale
}) => {
  const { id, repoId, network } = query;
  const { getIssue } = useApi();
  const currentIssue = await getIssue(repoId as string,
                                      id as string,
                                      network as string);

  return {
    props: {
      currentIssue,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request"
      ]))
    }
  };
};
