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
import GithubMicroService from "../services/github-microservice";

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;

  const [issue, setIssue] = useState<IIssue>();
  const [networkIssue, setNetworkIssue] = useState<any>();
  const [isIssueinDraft, setIsIssueinDraft] = useState();
  const [commentsIssue, setCommentsIssue] = useState(mockCommentsIssue);
  const [balance, setBalance] = useState();

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
    };
    const gets = async () => {
      await BeproService.login();

      /*const deploy = await BeproService.network.deploy({
        settlerTokenAddress: "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2",
        transactionTokenAddress: "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2",
        governanceAddress: "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
      });

      console.log("testing 02", deploy);*/
      
      /*console.log(`"testing2`, await GithubMicroService.getIssues());
      const test = await BeproService.network.getIssueById({ issueId: "7" });
      console.log("test bepro-js", test);

      /*const dispute = await BeproService.network.disputeMerge({
        issueId: "7",
        mergeID: "6",
      });

      console.log(`dispute`, dispute);*/
      const issue = await GithubMicroService.getIssueId(id);
      setIssue(issue);
      const issueId = id;
      const networkIssue = await BeproService.network.getIssueById({
        issueId: id,
      });
      console.log("newtowkrIssue ->", networkIssue);
      setNetworkIssue(networkIssue);
      setBalance(await BeproService.network.getBEPROStaked());
      console.log('network functions ->', await BeproService.network.isIssueinDraft)
      await BeproService.network.isIssueinDraft({
        issueId: "7",
      });
      //setIsIssueinDraft(isIssueInDraft);
      //console.log("network ->", networkIssue);
      /* const dispute = await BeproService.network.disputeMerge({
        issueID: "7",
        mergeID: "6",
      });*/
    };
    gets();
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
        isIssueinDraft={isIssueinDraft}
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
