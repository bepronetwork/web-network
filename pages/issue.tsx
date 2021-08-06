import { GetStaticProps } from "next";
import React, {useContext, useEffect, useState} from 'react';
import IssueComments from "../components/issue-comments";
import IssueDescription from "../components/issue-description";
import IssueHero from "../components/issue-hero";
import IssueDraftProgress from "../components/issue-draft-progress";
import PageActions from "../components/page-actions";
import IssueProposals from "../components/issue-proposals";
import { useRouter } from "next/router";
import {BeproService} from "../services/bepro-service";
import GithubMicroService from "../services/github-microservice";
import {ApplicationContext} from '../contexts/application';
import {IssueData} from '../interfaces/issue-data';

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;
  const {state: {currentAddress}} = useContext(ApplicationContext)

  const [issue, setIssue] = useState<IssueData>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(true);
  const [commentsIssue, setCommentsIssue] = useState();
  const [userAddress, setUserAddress] = useState<any>();
  const [balance, setBalance] = useState();
  const [forks, setForks] = useState();

  useEffect(() => {
    if (!currentAddress)
      return;

    const gets = async () => {

      const address = BeproService.address;
      setUserAddress(address);
      const issue = await GithubMicroService.getIssueId(id);
      setIssue(issue);
      console.log('microService issue ->', issue)
      const networkIssue = await BeproService.network.getIssueById({
        issueId: id,
      });
      console.log('bepro issue ->', networkIssue)
      setNetworkIssue(networkIssue);
      setBalance(await BeproService.network.getBEPROStaked());
      const isIssueInDraft = await BeproService.network.isIssueInDraft({
        issueId: id,
      });
      setIsIssueinDraft(isIssueInDraft);
      console.log("issue in draft", isIssueInDraft);
      const comments = await GithubMicroService.getCommentsIssue(
        issue.githubId
      );
      setCommentsIssue(comments);
      
      const forks = await GithubMicroService.getForks()
      setForks(forks)
    };

    gets();

  }, [currentAddress]);

  const handleStateissue = () => {
    if (isIssueinDraft) {
      return "Draft";
    } else if (!isIssueinDraft && networkIssue.finalized) {
      return "Closed";
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
        userAddress={userAddress}
        addressNetwork={networkIssue?.cid}
        issueId={issue?.issueId}
        UrlGithub={issue?.url}
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
      <IssueComments
        url={issue?.url || "/"}
        comments={commentsIssue}
      ></IssueComments>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
