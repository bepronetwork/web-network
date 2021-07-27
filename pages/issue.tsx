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

export default function PageIssue() {
  const [issue, setIssue] = useState<IIssue>(mockDeveloperIssues[3]);

  return (
    <>
      <IssueHero></IssueHero>
      {issue?.state.toLowerCase() === "draft" && <IssueDraftProgress />}

      {/*<IssueProposals></IssueProposals>
       */}
      <PageActions issue={issue}></PageActions>

      <IssueDescription
        description={`Change the architecture of Application.getContractType()<br></br><br></br>
                        Example<br></br>
                        Instead of using<br></br><br></br>
                        erc721Contract = app.getERC721Collectibles({ });<br></br><br></br>
                        to use<br></br>
                        import ERC721Collectibles from ...<br></br>
                        let erc721Contract = new ERC721Collectibles();<br></br>`}
      ></IssueDescription>
      <IssueComments url="/" comments={mockCommentsIssue}></IssueComments>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
