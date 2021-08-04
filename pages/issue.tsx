import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import IssueComments from "../components/issue-comments";
import IssueDescription from "../components/issue-description";
import IssueHero from "../components/issue-hero";
import IssueDraftProgress from "../components/issue-draft-progress";
import PageActions from "../components/page-actions";
import IssueProposals from "../components/issue-proposals";
import { IIssue } from "../components/issue-list-item";
import { useRouter } from "next/router";
import BeproService from "../services/bepro";
import { isIssuesinDraft } from "../helpers/mockdata/mockIssueInDraft";
import GithubMicroService from "../services/github-microservice";

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;

  const [issue, setIssue] = useState<IIssue>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState(true);
  const [commentsIssue, setCommentsIssue] = useState();
  const [userAddress, setUserAddress] = useState<any>();
  const [balance, setBalance] = useState();

  useEffect(() => {
    const gets = async () => {
      await BeproService.login();
      const address = await BeproService.getAddress();
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
  }, []);

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
