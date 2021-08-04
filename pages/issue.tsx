import { GetStaticProps } from "next";
import React, {useContext, useEffect, useState} from 'react';
import IssueComments from "../components/issue-comments";
import IssueDescription from "../components/issue-description";
import IssueHero from "../components/issue-hero";
import IssueDraftProgress from "../components/issue-draft-progress";
import PageActions from "../components/page-actions";
import IssueProposals from "../components/issue-proposals";
import { IIssue } from "../components/issue-list-item";
import { useRouter } from "next/router";
import {BeproService} from "../services/bepro-service";
import GithubMicroService from "../services/github-microservice";
import {ApplicationContext} from '../contexts/application';

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;
  const {state: {currentAddress}} = useContext(ApplicationContext)

  const [issue, setIssue] = useState<IIssue>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(true);
  const [commentsIssue, setCommentsIssue] = useState();
  const [userAddress, setUserAddress] = useState<any>();
  const [balance, setBalance] = useState();

  useEffect(() => {
    if (!currentAddress)
      return;

    const gets = async () => {

      const address = BeproService.address;
      setUserAddress(address);
      console.log('user adrress', address)
      const issue = await GithubMicroService.getIssueId(id);
      setIssue(issue);

      const networkIssue = await BeproService.network.getIssueById({
        issueId: id,
      });
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
      <IssueHero state={handleStateissue()} issue={issue}></IssueHero>
      {handleStateissue() === "Draft" && (
        <IssueDraftProgress
          amountTotal={balance}
          amountUsed={networkIssue?.tokensStaked}
        />
      )}
      <PageActions
        state={handleStateissue()}
        developers={issue?.developers}
        finalized={networkIssue?.finalized}
        isIssueinDraft={isIssueinDraft}
        userAddress={userAddress}
        addressNetwork={networkIssue?.cid}
        issueId={issue?.issueId}
        UrlGithub={issue?.url}
      />
      {handleStateissue() === "Open" && <IssueProposals></IssueProposals>}

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
