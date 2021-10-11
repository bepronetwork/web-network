import {GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import IssueComments from '@components/issue-comments';
import IssueDescription from '@components/issue-description';
import IssueHero from '@components/issue-hero';
import PageActions from '@components/page-actions';
import IssueProposals from '@components/issue-proposals';
import {useRouter} from 'next/router';
import {BeproService} from '@services/bepro-service';
import GithubMicroService, {User} from '@services/github-microservice';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';

interface NetworkIssue {
  recognizedAsFinished: boolean;
}

export default function PageIssue() {
  const router = useRouter();
  const {id} = router.query;
  const {
    state: {githubHandle, currentAddress},
  } = useContext(ApplicationContext);

  const [issue, setIssue] = useState<IssueData>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(false);
  const [commentsIssue, setCommentsIssue] = useState();
  const [balance, setBalance] = useState();
  const [forks, setForks] = useState();
  const [canOpenPR, setCanOpenPR] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>();

  const getsIssueMicroService = () => {
    GithubMicroService.getIssueId(id)
                      .then((issue) => {
                        if (!issue)
                          return;

                        setIssue(issue);
                        GithubMicroService.getCommentsIssue(issue.githubId, issue.repository_id)
                                          .then((comments) => setCommentsIssue(comments));
                      });

    GithubMicroService.getForks().then((forks) => setForks(forks));
  };

  const getsIssueBeproService = () => {
    getNetworkIssue();
    setBalance(BeproService.network.getBEPROStaked());
    BeproService.network
                .isIssueInDraft({
                                  issueId: id,
                                })
                .then((isIssueInDraft) => setIsIssueinDraft(isIssueInDraft));
  };

  const getCurrentUserMicroService = () => {
    GithubMicroService.getUserOf(currentAddress).then((user: User) =>
                                                        setCurrentUser(user)
    );
  };

  const getRepoForked = () =>{
    GithubMicroService.getForkedRepo(githubHandle, id.toString())
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

  useEffect(loadIssueData, [githubHandle,currentAddress, id]);

  const getNetworkIssue = () => {
    BeproService.network
                .getIssueById({
                                issueId: id,
                              })
                .then((networkIssue) => {
                  setNetworkIssue(networkIssue)
                });
  };

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
        amount={networkIssue?.tokensStaked}
        state={handleStateissue()}
        issue={issue}/>
      <PageActions
        state={handleStateissue()}
        developers={issue?.developers}
        finalized={networkIssue?.finalized}
        isIssueinDraft={isIssueinDraft}
        addressNetwork={networkIssue?.cid}
        issueId={issue?.issueId}
        UrlGithub={issue?.url}
        title={issue?.title}
        description={issue?.body}
        handleBeproService={getsIssueBeproService}
        handleMicroService={getsIssueMicroService}
        pullRequests={issue?.pullRequests}
        mergeProposals={networkIssue?.mergeProposalsAmount}
        amountIssue={networkIssue?.tokensStaked}
        forks={forks}
        githubLogin={currentUser?.githubLogin}
        canOpenPR={canOpenPR}
        githubId={issue?.githubId} finished={networkIssue?.recognizedAsFinished}/>
      {networkIssue?.mergeProposalsAmount > 0 && (
        <IssueProposals
          numberProposals={networkIssue?.mergeProposalsAmount}
          issueId={issue?.issueId}
          amount={networkIssue?.tokensStaked}
        />
      )}

      <IssueDescription description={issue?.body}></IssueDescription>
      <IssueComments comments={commentsIssue}></IssueComments>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
