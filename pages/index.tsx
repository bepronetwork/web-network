import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { IIssue } from "../components/issue-list-item";
import PageHero from "../components/page-hero";
import { isEmpty } from "lodash";
import { setLoadingAttributes } from "../providers/loading-provider";
import GithubMicroService from "../services/github-microservice";
import ListIssues from "../components/list-issues";

export default function Home() {
  const [issues, setIssues] = useState<IIssue[]>([]);

  useEffect(() => {
    getIssues();
  }, []);

  const getIssues = async () => {
    if (isEmpty(issues)) {
      setLoadingAttributes(true);
    }
    await GithubMicroService.getIssues()
      .then((issues) => setIssues(issues))
      .catch((error) => console.log("Error", error))
      .finally(() => setLoadingAttributes(false));
  };

  return (
    <div>
      <PageHero
        title="Find issue to work"
        numIssuesInProgress={6}
        numIssuesClosed={123}
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
