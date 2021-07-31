import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import IssueComments from "../components/issue-comments";
import IssueDescription from "../components/issue-description";
import IssueHero from "../components/issue-hero";
import IssueDraftProgress from "../components/issue-draft-progress";
import PageActions from "../components/page-actions";
import IssueProposals from "../components/issue-proposals";
import {
  mockNewIssues,
  mockReadyIssues,
  mockDeveloperIssues,
} from "../helpers/mockdata/mockIssues";
import { mockCommentsIssue } from "../helpers/mockdata/mockCommentsIssue";
import { IIssue } from "../components/issue-list-item";
import { useRouter } from "next/router";
import BeproService from "../services/bepro";
import { NetworkIssues } from "../helpers/mockdata/mockNetworkIssue";
import { isIssuesinDraft } from "../helpers/mockdata/mockIssueInDraft";

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;

  const [issue, setIssue] = useState(
    mockDeveloperIssues.find((element) => element.issueId === id)
  );
  const [networkIssue, setNetworkIssue] = useState(
    NetworkIssues.find((element) => element.issueId === id)
  );
  const [isIssueinDraft, setIsIssueinDraft] = useState(
    isIssuesinDraft.find((element) => element.issueId === id)
  );

  const [commentsIssue, setCommentsIssue] = useState(mockCommentsIssue);
  const [balance, setBalance] = useState(600);

  const getIssueNetwork = async () => {
    await BeproService.login();
    setNetworkIssue(
      await BeproService.network.getIssueById({
        issueId: id,
      })
    );
  };
  const getisIssueinDraft = async () => {
    await BeproService.login();
    setIsIssueinDraft(
      await BeproService.network.isIssueinDraft({
        issueId: id,
      })
    );
  };

  useEffect(() => {
    //getIssueNetwork();
    //getisIssueinDraft();
    const getBalance = async () => {
      await BeproService.login();
      setBalance(await BeproService.network.getBEPROStaked());
    };
    //getBalance();
  }, []);

  return (
    <>
      <IssueHero issue={issue}></IssueHero>
      {issue?.state.toLowerCase() === "draft" && (
        <IssueDraftProgress
          amountTotal={balance}
          amountUsed={networkIssue?.tokensStaked}
        />
      )}
      <PageActions
        finalized={networkIssue?.finalized}
        isIssueinDraft={isIssueinDraft?.value}
        userAddress="0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d"
        issue={issue}
      />
      {issue?.state.toLocaleLowerCase() === "ready" && (
        <IssueProposals></IssueProposals>
      )}

      <IssueDescription description={issue?.body}></IssueDescription>
      <IssueComments url="/" comments={commentsIssue}></IssueComments>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
