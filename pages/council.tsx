import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import IssueListItem, { IIssue } from "../components/issue-list-item";
import ListIssues from "../components/list-issues";
import PageHero from "../components/page-hero";
import GithubMicroService from "../services/github-microservice";

export default function PageCouncil() {
  const [issues, setIssues] = useState<[IIssue]>();

  useEffect(() => {
    getIssues();
  }, []);

  const getIssues = async () => {
    const issues = await GithubMicroService.getIssuesState({
      filterState: "ready",
    });
    setIssues(issues);
    console.log("issues", issues);
  };

  return (
    <div>
      <PageHero
        title="Ready to propose"
        numIssuesInProgress={10}
        numIssuesClosed={12}
        numBeprosOnNetwork={120000}
      ></PageHero>
      <div className="container">
        <div className="row justify-content-center">
          <ListIssues listIssues={issues} />
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
