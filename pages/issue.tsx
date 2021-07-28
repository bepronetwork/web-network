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

export default function PageIssue() {
  const router = useRouter();
  const { id } = router.query;

  const [issue] = useState<IIssue>(
    mockDeveloperIssues.find((element) => element.issueId === id)
  );

  return (
    <>
      <IssueHero issue={issue}></IssueHero>
      {issue?.state.toLowerCase() === "draft" && (
        <IssueDraftProgress amountTotal={600} amountUsed={300} />
      )}

      {/*<IssueProposals></IssueProposals>*/}

      <PageActions
        finalized={true}
        userAddress="0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d"
        issue={issue}
      ></PageActions>

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
