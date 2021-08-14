import { GetStaticProps } from "next";
import React, { useContext, useEffect, useState } from "react";
import IssueComments from "../components/issue-comments";
import IssueDescription from "../components/issue-description";
import IssueHero from "../components/issue-hero";
import PageActions from "../components/page-actions";
import IssueProposals from "../components/issue-proposals";
import { useRouter } from "next/router";
import { BeproService } from "../services/bepro-service";
import GithubMicroService from "../services/github-microservice";
import { ApplicationContext } from "../contexts/application";
import { IssueData } from "../interfaces/issue-data";

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;
  const {
    state: { currentAddress },
  } = useContext(ApplicationContext);

  const [issue, setIssue] = useState<IssueData>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(true);
  const [commentsIssue, setCommentsIssue] = useState();
  const [balance, setBalance] = useState();
  const [forks, setForks] = useState();

  const getsIssueMicroService = () => {
    GithubMicroService.getIssueId(id).then((issue) => {
      setIssue(issue);
      GithubMicroService.getCommentsIssue(issue.githubId).then((comments) =>
        setCommentsIssue(comments)
      );
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

  const gets = () => {
    if (currentAddress && id) {
      getsIssueMicroService();
      getsIssueBeproService();
    } else if (id) getsIssueMicroService();
  };
  useEffect(gets, [currentAddress, id]);

  const getNetworkIssue = () => {
    BeproService.network
      .getIssueById({
        issueId: id,
      })
      .then((networkIssue) => setNetworkIssue(networkIssue));
  };

  const handleStateissue = () => {
    if (!isIssueinDraft) return issue?.state;

    if (networkIssue?.finalized) {
      return "Closed";
    } else if (isIssueinDraft) {
      return "Draft";
    } else {
      return "Open";
    }
  };

  return (
    <>
      <IssueHero
        amount={networkIssue?.tokensStaked}
        state={handleStateissue()}
        issue={issue}
      />
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
        handleNetworkIssue={getNetworkIssue}
        pullRequests={issue?.pullRequests}
        amountIssue={networkIssue?.tokensStaked}
        forks={forks}
      />
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
