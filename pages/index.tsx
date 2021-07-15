import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { IIssue } from "../components/issue-list-item";
import PageHero from "../components/page-hero";
import { isEmpty } from "lodash";
import { setLoadingAttributes } from "../providers/loading-provider";
import GithubMicroService from "../services/github-microservice";
import ListIssues from "../components/list-issues";
import ReactSelect from "../components/react-select";

const options_issue = [
  {
    value: "All issues",
    label: "All issues",
  },
  {
    value: "Open issues",
    label: "Open issues",
  },
  {
    value: "In progress issues",
    label: "In progress issues",
  },
  {
    value: "Ready issues",
    label: "Ready issues",
  },
  {
    value: "Draft issues",
    label: "Draft issues",
  },
];

const options_time = [
  {
    value: "All time",
    label: "All time",
  },
];

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
          <div className="col-md-10">
            <div className="d-flex justify-content-between mb-4">
              <div className="col-md-3">
                <ReactSelect
                  className="react-select-filterIssues"
                  defaultValue={options_issue[0]}
                  options={options_issue}
                />
              </div>
              <div className="col-md-3">
                <ReactSelect
                  className="react-select-filterIssues"
                  defaultValue={options_time[0]}
                  options={options_time}
                />
              </div>
            </div>
          </div>
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
