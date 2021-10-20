import { GetStaticProps } from 'next/types';
import React, { useContext, useEffect, useState } from 'react';
import IssueComments from '@components/issue-comments';
import IssueDescription from '@components/issue-description';
import IssueHero from '@components/issue-hero';
import PageActions from '@components/page-actions';
import IssueProposals from '@components/issue-proposals';
import { useRouter } from 'next/router';
import { BeproService } from '@services/bepro-service';
import GithubMicroService, { User } from '@services/github-microservice';
import { ApplicationContext } from '@contexts/application';
import { IssueData } from '@interfaces/issue-data';
import { formatNumberToCurrency } from '@helpers/formatNumber';
import IssueProposalProgressBar from '@components/issue-proposal-progress-bar';

interface NetworkIssue {
  recognizedAsFinished: boolean;
}

export default function PageIssue() {
  const router = useRouter();
  const { id, repoId } = router.query;
  const { state: { githubHandle, currentAddress, githubLogin }, } = useContext(ApplicationContext);

  const [issue, setIssue] = useState<IssueData>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(false);
  const [commentsIssue, setCommentsIssue] = useState();
  const [forks, setForks] = useState();
  const [canOpenPR, setCanOpenPR] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>();

  function getIssueCID() {
    return [repoId, id].join(`/`)
  }

  const getsIssueMicroService = () => {

    GithubMicroService.getIssuesByGhId(id, repoId as string)
      .then((issue) => {
        if (!issue)
          return;

        setIssue(issue);
        GithubMicroService.getCommentsIssue(issue.githubId, issue.repository_id)
          .then((comments) => setCommentsIssue(comments));
      });

    GithubMicroService.getForks().then((forks) => setForks(forks));
  };

  function getsIssueBeproService() {
    if (!currentAddress)
      return;

    BeproService.network.getIssueByCID({ issueCID: getIssueCID() })
      .then(netIssue => {
        setNetworkIssue(netIssue);
        return netIssue._id;
      })
      .then(issueId => BeproService.network.isIssueInDraft({ issueId }))
      .then((isIssueInDraft) => setIsIssueinDraft(isIssueInDraft))
      .catch(e => {
        console.error(`Failed to fetch network issue or draft state`, e);
      });
  }

  const getCurrentUserMicroService = () => {
    if (currentAddress == currentUser?.address)
      return;

    GithubMicroService.getUserOf(currentAddress)
      .then((user: User) => setCurrentUser(user));
  };

  const getRepoForked = () => {
    GithubMicroService.getForkedRepo(githubLogin, [repoId, id].join(`/`))
      .then((repo) => setCanOpenPR(!!repo))
  }

  function loadIssueData() {
    if (currentAddress && id) {
      getsIssueMicroService();
      getsIssueBeproService();
      getCurrentUserMicroService();
    } else if (id) getsIssueMicroService();

    if (githubHandle) getRepoForked();
  }

  useEffect(loadIssueData, [githubHandle, currentAddress, id]);
  useEffect(getsIssueMicroService, [])

  const handleStateissue = () => {
    if (issue?.state) return issue?.state;

    if (isIssueinDraft) {
      return 'Draft';
    } else if (networkIssue?.finalized) {
      return 'Closed';
    } else {
      return 'Open';
    }
  };

  return (
    <>
      <IssueHero
        amount={formatNumberToCurrency(issue?.amount || networkIssue?.tokensStaked)}
        state={handleStateissue()}
        issue={issue} />
      <PageActions
        state={handleStateissue()}
        developers={issue?.developers}
        finalized={networkIssue?.finalized}
        isIssueinDraft={isIssueinDraft}
        networkCID={networkIssue?.cid}
        issueId={issue?.issueId}
        title={issue?.title}
        description={issue?.body}
        handleBeproService={getsIssueBeproService}
        handleMicroService={getsIssueMicroService}
        pullRequests={issue?.pullRequests || []}
        mergeProposals={networkIssue?.mergeProposalsAmount}
        amountIssue={networkIssue?.tokensStaked}
        forks={forks}
        githubLogin={currentUser?.githubLogin}
        canOpenPR={canOpenPR}
        issueCreator={networkIssue?.issueGenerator}
        repoPath={issue?.repo}
        githubId={issue?.githubId}
        finished={networkIssue?.recognizedAsFinished} />
      {networkIssue?.mergeProposalsAmount > 0 && (
        <IssueProposals
          metaProposals={issue?.mergeProposals}
          metaRequests={issue?.pullRequests}
          numberProposals={networkIssue?.mergeProposalsAmount}
          issueId={issue?.issueId}
          dbId={issue?.id}
          amount={networkIssue?.tokensStaked}
        />
      )}
      {networkIssue && <IssueProposalProgressBar
        isFinalized={networkIssue?.finalized}
        isIssueinDraft={issue?.state === `draft` || issue?.pullRequests.length < 1}
        mergeProposalsAmount={networkIssue?.mergeProposalsAmount}
        isFinished={networkIssue?.recognizedAsFinished}
        isCanceled={issue?.state === `canceled` || networkIssue?.canceled}
      />}

      <IssueDescription description={issue?.body}></IssueDescription>
      <IssueComments comments={commentsIssue} repo={issue?.repo} issueId={issue?.id}></IssueComments>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
