import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { IIssue } from "../components/issue-list-item";
import ListIssues from "../components/list-issues";
import PageHero from "../components/page-hero";
import GithubMicroService from "../services/github-microservice";
import { setLoadingAttributes } from "../providers/loading-provider";
import { isEmpty } from "lodash";

export default function PageCouncil() {
  const [issues, setIssues] = useState<IIssue[]>([]);

  useEffect(() => {
    getIssues();
  }, []);

  const getIssues = async () => {
    if (isEmpty(issues)) {
      setLoadingAttributes(true);
    }
    await GithubMicroService.getIssuesState({
      filterState: "ready",
    })
      .then((issues) => setIssues(issues))
      .catch((error) => console.log("Error", error))
      .finally(() => setLoadingAttributes(false));
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
