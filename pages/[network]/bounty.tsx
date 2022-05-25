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
import useOctokitGraph from "x-hooks/use-octokit-graph";

export default function PageIssue() {
  const router = useRouter();
  const { t } = useTranslation("bounty");

  const [commentsIssue, setCommentsIssue] = useState([]);
  const [isRepoForked, setIsRepoForked] = useState(false);

  const { activeRepo } = useRepos();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokitGraph();

  const {
    activeIssue,
    networkIssue
  } = useIssue();

  const { id } = router.query;

  const tabs: TabbedNavigationItem[] = [
    {
      eventKey: "proposals",
      title: (
        <Translation
          ns="proposal"
          label={"labelWithCount"}
          params={{ count: +networkIssue?.proposals?.length || 0 }}
        />
      ),
      isEmpty: !(networkIssue?.proposals?.length > 0),
      component: (
        <IssueProposals
          key="tab-proposals"
          issue={activeIssue}
          className="border-top-0"
          networkIssue={networkIssue}
        />
      ),
      description: t("description_proposal")
    },
    {
      eventKey: "pull-requests",
      isEmpty: !(networkIssue?.pullRequests?.length > 0),
      title: (
        <Translation
          ns="pull-request"
          label={"labelWithCount"}
          params={{ count: networkIssue?.pullRequests?.length || 0 }}
        />
      ),
      component: (
        <IssuePullRequests
          key="tab-pull-requests"
          className="border-top-0"
          issue={activeIssue}
          networkIssue={networkIssue}
        />
      ),
      description: t("description_pull-request")
    }
  ];

  function getRepoForked() {
    if (!activeRepo || !user?.login) return;

    getUserRepositories(user?.login)
      .then((repos) => {
        const isForked = 
          !!repos.find(repo => (repo.isFork && repo.nameWithOwner === `${user.login}/${activeRepo.name}`) 
                                || repo.nameWithOwner === activeRepo.githubPath);

        setIsRepoForked(isForked);
      })
      .catch((e) => {
        console.log("Failed to get users repositories: ", e);
      });
  }

  function checkRepoForked() {
    if (user?.login && activeRepo) getRepoForked();
  }

  function addNewComment(comment) {
    setCommentsIssue([...commentsIssue, comment]);
  }

  function syncLocalyState() {
    // eslint-disable-next-line no-unsafe-optional-chaining
    if (activeIssue?.comments) setCommentsIssue([...activeIssue?.comments]);
  }

  useEffect(syncLocalyState, [ activeIssue, activeRepo ]);
  useEffect(checkRepoForked, [ user?.login, wallet?.address, id, activeIssue, activeRepo ]);

  return (
    <>
      <BountyHero />

      <PageActions
        isRepoForked={isRepoForked}
        addNewComment={addNewComment}
      />
      {(networkIssue?.proposals?.length > 0 ||
        networkIssue?.pullRequests?.length > 0) &&
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
                <IssueDescription description={activeIssue?.body || ""} />
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
                    activeIssue?.state === "canceled" || networkIssue?.canceled
                  }
                  creationDate={networkIssue.creationDate}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CustomContainer>
          <IssueDescription description={activeIssue?.body || ""} />
        </CustomContainer>
      )}
      <IssueComments
        comments={commentsIssue}
        repo={activeIssue?.repository?.githubPath}
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
