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
    value: "all",
    label: "All issues",
  },
  {
    value: "open",
    label: "Open issues",
  },
  {
    value: "in progress",
    label: "In progress issues",
  },
  {
    value: "ready",
    label: "Ready issues",
  },
  {
    value: "draft",
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
  const [filterStateIssues, setfilterStateIssues] = useState({
    state: "",
    issues: issues,
  });

  useEffect(() => {
    getIssues();
  }, []);

  const getIssues = async () => {
    if (isEmpty(issues)) {
      setLoadingAttributes(true);
    }
    await GithubMicroService.getIssues()
      .then((issues) => {
        setIssues(issues);
        setfilterStateIssues({ state: "all", issues });
      })
      .catch((error) => console.log("Error", error))
      .finally(() => setLoadingAttributes(false));
  };

  const handleChangeFilterIssue = (params: {
    value: string;
    label: string;
  }) => {
    if (params.value === "all") {
      setfilterStateIssues({
        state: params.value,
        issues,
      });
    } else {
      setfilterStateIssues({
        state: params.value,
        issues: issues.filter(
          (obj: IIssue) => obj.state.toLowerCase() === params.value
        ),
      });
    }
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
                  id="filterIssue"
                  className="react-select-filterIssues"
                  defaultValue={options_issue[0]}
                  options={options_issue}
                  onChange={handleChangeFilterIssue}
                />
              </div>
              <div className="col-md-3">
                <ReactSelect
                  id="filterTime"
                  className="react-select-filterIssues trans"
                  defaultValue={options_time[0]}
                  options={options_time}
                  isDisabled
                />
              </div>
            </div>
          </div>
          <ListIssues listIssues={filterStateIssues.issues} />
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
